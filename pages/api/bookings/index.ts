import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    try {
      const bookings = await prisma.booking.findMany({
        where: { userId: (session.user as any).id },
        orderBy: { createdAt: 'desc' }
      })
      res.status(200).json(bookings)
    } catch (error) {
      console.error('Error fetching bookings:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else if (req.method === 'POST') {
    const { date, time, serviceType, notes, price, duration } = req.body

    if (!date || !time || !serviceType) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    try {
      const booking = await prisma.booking.create({
        data: {
          userId: (session.user as any).id,
          date: new Date(date),
          time,
          serviceType,
          notes,
          price: price ? parseFloat(price) : null,
          duration: duration ? parseInt(duration) : null
        }
      })
      res.status(201).json(booking)
    } catch (error) {
      console.error('Error creating booking:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}