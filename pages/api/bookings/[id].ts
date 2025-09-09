import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid booking ID' })
  }

  // Verify the booking belongs to the user
  const booking = await prisma.booking.findFirst({
    where: {
      id,
      userId: (session.user as any).id
    }
  })

  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' })
  }

  if (req.method === 'GET') {
    res.status(200).json(booking)
  } else if (req.method === 'PUT') {
    const { date, time, serviceType, notes, price, duration, status } = req.body

    try {
      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: {
          ...(date && { date: new Date(date) }),
          ...(time && { time }),
          ...(serviceType && { serviceType }),
          ...(notes !== undefined && { notes }),
          ...(price !== undefined && { price: price ? parseFloat(price) : null }),
          ...(duration !== undefined && { duration: duration ? parseInt(duration) : null }),
          ...(status && { status })
        }
      })
      res.status(200).json(updatedBooking)
    } catch (error) {
      console.error('Error updating booking:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else if (req.method === 'DELETE') {
    try {
      await prisma.booking.delete({
        where: { id }
      })
      res.status(200).json({ message: 'Booking deleted successfully' })
    } catch (error) {
      console.error('Error deleting booking:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}