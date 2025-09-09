import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'
import fs from 'fs'
import path from 'path'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Load config from JSON file
      const configPath = path.join(process.cwd(), 'config.json')
      const configData = fs.readFileSync(configPath, 'utf8')
      const config = JSON.parse(configData)

      // Get current date and next 30 days
      const today = new Date()
      const endDate = new Date()
      endDate.setDate(today.getDate() + 30)

      // Get booked slots from database
      const bookings = await prisma.booking.findMany({
        where: {
          status: {
            not: 'cancelled'
          },
          date: {
            gte: today.toISOString().split('T')[0],
            lte: endDate.toISOString().split('T')[0]
          }
        },
        select: {
          date: true,
          time: true
        }
      })

      // Generate available slots
      const availableSlots = []
      const bookedSlots = new Set(bookings.map(b => `${b.date}-${b.time}`))

      for (let date = new Date(today); date <= endDate; date.setDate(date.getDate() + 1)) {
        const dateStr = date.toISOString().split('T')[0]
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()

        // Skip holidays
        if (config.holidays.includes(dateStr)) continue

        // Skip non-working days
        if (!config.workingHours[dayName]) continue

        const workingDay = config.workingHours[dayName]
        const startTime = new Date(`${dateStr}T${workingDay.start}`)
        const endTime = new Date(`${dateStr}T${workingDay.end}`)
        const breakStart = workingDay.break ? new Date(`${dateStr}T${workingDay.break[0]}`) : null
        const breakEnd = workingDay.break ? new Date(`${dateStr}T${workingDay.break[1]}`) : null

        // Generate time slots
        for (let time = new Date(startTime); time < endTime; time.setMinutes(time.getMinutes() + config.appointmentDuration)) {
          const timeStr = time.toTimeString().slice(0, 5)

          // Skip break time
          if (breakStart && breakEnd && time >= breakStart && time < breakEnd) continue

          // Skip if already booked
          if (!bookedSlots.has(`${dateStr}-${timeStr}`)) {
            availableSlots.push({
              date: dateStr,
              time: timeStr,
              day: dayName
            })
          }
        }
      }

      res.status(200).json(availableSlots)
    } catch (error) {
      console.error('Error fetching availability:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}