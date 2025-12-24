package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
)

type Visit struct {
	PatientName string `json:"patient_name"`
	DateOfVisit string `json:"date_of_visit"`
	Notes       string `json:"notes"`
}

const DevOpsSystemPrompt = `You are an expert DevOps and Cloud Infrastructure analyst.
You provide clear, actionable advice on deployment logs, infrastructure issues, and cloud optimization.
Be concise, technical, and focus on practical solutions.`

func HandleConsultation(w http.ResponseWriter, r *http.Request) {
	// Enable CORS
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var visit Visit
	if err := json.NewDecoder(r.Body).Decode(&visit); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	prompt := visit.Notes
	provider := os.Getenv("LLM_PROVIDER")
	if provider == "" {
		provider = "gemini"
	}

	switch provider {
	case "openai":
		streamOpenAI(w, prompt)
	case "gemini":
		streamGemini(w, prompt)
	default:
		fmt.Fprintf(w, "data: ❌ Invalid LLM_PROVIDER: %s\n\n", provider)
	}
}

func streamOpenAI(w http.ResponseWriter, prompt string) {
	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		fmt.Fprintf(w, "data: ❌ OPENAI_API_KEY not set\n\n")
		return
	}

	body := map[string]interface{}{
		"model": "gpt-4o-mini",
		"messages": []map[string]string{
			{"role": "system", "content": DevOpsSystemPrompt},
			{"role": "user", "content": prompt},
		},
		"stream": true,
	}

	bodyBytes, _ := json.Marshal(body)
	req, _ := http.NewRequest("POST", "https://api.openai.com/v1/chat/completions", bytes.NewReader(bodyBytes))
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Fprintf(w, "data: ❌ Error: %v\n\n", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		fmt.Fprintf(w, "data: ❌ OpenAI API error: %d\n\n", resp.StatusCode)
		return
	}

	scanner := bufio.NewScanner(resp.Body)
	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "data: ") {
			data := strings.TrimPrefix(line, "data: ")
			if data == "[DONE]" {
				break
			}
			var choice map[string]interface{}
			if err := json.Unmarshal([]byte(data), &choice); err != nil {
				continue
			}

			if choices, ok := choice["choices"].([]interface{}); ok && len(choices) > 0 {
				if c, ok := choices[0].(map[string]interface{}); ok {
					if delta, ok := c["delta"].(map[string]interface{}); ok {
						if content, ok := delta["content"].(string); ok {
							fmt.Fprintf(w, "data: %s\n\n", content)
							w.(http.Flusher).Flush()
						}
					}
				}
			}
		}
	}
}

func streamGemini(w http.ResponseWriter, prompt string) {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		fmt.Fprintf(w, "data: ❌ GEMINI_API_KEY not set\n\n")
		return
	}

	body := map[string]interface{}{
		"contents": []map[string]interface{}{
			{
				"parts": []map[string]string{
					{"text": prompt},
				},
			},
		},
		"systemInstruction": map[string]interface{}{
			"parts": []map[string]string{
				{"text": DevOpsSystemPrompt},
			},
		},
	}

	bodyBytes, _ := json.Marshal(body)
	url := "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=" + apiKey
	req, _ := http.NewRequest("POST", url, bytes.NewReader(bodyBytes))
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Fprintf(w, "data: ❌ Error: %v\n\n", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		fmt.Fprintf(w, "data: ❌ Gemini API error: %d\n\n", resp.StatusCode)
		return
	}

	scanner := bufio.NewScanner(resp.Body)
	for scanner.Scan() {
		line := scanner.Text()
		var response map[string]interface{}
		if err := json.Unmarshal([]byte(line), &response); err != nil {
			continue
		}

		if candidates, ok := response["candidates"].([]interface{}); ok && len(candidates) > 0 {
			if cand, ok := candidates[0].(map[string]interface{}); ok {
				if content, ok := cand["content"].(map[string]interface{}); ok {
					if parts, ok := content["parts"].([]interface{}); ok && len(parts) > 0 {
						if part, ok := parts[0].(map[string]interface{}); ok {
							if text, ok := part["text"].(string); ok {
								fmt.Fprintf(w, "data: %s\n\n", text)
								w.(http.Flusher).Flush()
							}
						}
					}
				}
			}
		}
	}
}

func main() {
	http.HandleFunc("/api", HandleConsultation)
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"status":"ok","provider":"%s"}`, os.Getenv("LLM_PROVIDER"))
	})

	port := ":8080"
	log.Printf("🚀 DevOps AI Backend running on %s", port)
	log.Fatal(http.ListenAndServe(port, nil))
}
