import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'GET,POST,OPTIONS')
    res.status(200).end()
    return
  }

  res.status(200).json({ ok: true, route: '/api/ping' })
}
