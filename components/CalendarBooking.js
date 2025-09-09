import { useState, useEffect } from 'react'

export default function CalendarBooking({ onDateTimeSelect, selectedService }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState('')
  const [availableSlots, setAvailableSlots] = useState([])
  const [bookedSlots, setBookedSlots] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAvailability()
  }, [currentMonth])

  const fetchAvailability = async () => {
    try {
      const response = await fetch('/api/availability')
      if (response.ok) {
        const data = await response.json()
        setAvailableSlots(data)
      }
    } catch (error) {
      console.error('Error fetching availability:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const isDateAvailable = (date) => {
    if (!date) return false
    const dateStr = date.toISOString().split('T')[0]
    return availableSlots.some(slot => slot.date === dateStr)
  }

  const isDateBooked = (date) => {
    if (!date) return false
    const dateStr = date.toISOString().split('T')[0]
    return bookedSlots.some(slot => slot.date === dateStr)
  }

  const getAvailableTimesForDate = (date) => {
    if (!date) return []
    const dateStr = date.toISOString().split('T')[0]
    return availableSlots
      .filter(slot => slot.date === dateStr)
      .map(slot => slot.time)
      .sort()
  }

  const handleDateClick = (date) => {
    if (date && isDateAvailable(date)) {
      setSelectedDate(date)
      setSelectedTime('')
    }
  }

  const handleTimeSelect = (time) => {
    setSelectedTime(time)
    if (selectedDate && time) {
      onDateTimeSelect({
        date: selectedDate.toISOString().split('T')[0],
        time: time
      })
    }
  }

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      newMonth.setMonth(prev.getMonth() + direction)
      return newMonth
    })
    setSelectedDate(null)
    setSelectedTime('')
  }

  const days = getDaysInMonth(currentMonth)
  const monthNames = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ]

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">เลือกวันที่และเวลา</h3>

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 hover:bg-gray-100 rounded-md"
        >
          ‹
        </button>
        <h4 className="text-lg font-semibold">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h4>
        <button
          onClick={() => navigateMonth(1)}
          className="p-2 hover:bg-gray-100 rounded-md"
        >
          ›
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}

        {days.map((date, index) => (
          <div
            key={index}
            className={`
              p-2 text-center text-sm cursor-pointer rounded-md border
              ${!date ? 'bg-gray-50' : ''}
              ${date && isDateAvailable(date) ? 'bg-green-100 hover:bg-green-200 border-green-300' : ''}
              ${date && isDateBooked(date) ? 'bg-red-100 border-red-300' : ''}
              ${date && !isDateAvailable(date) && !isDateBooked(date) ? 'bg-gray-100 border-gray-300' : ''}
              ${selectedDate && date && selectedDate.toDateString() === date.toDateString() ? 'ring-2 ring-blue-500' : ''}
            `}
            onClick={() => handleDateClick(date)}
          >
            {date ? date.getDate() : ''}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
          <span>ว่าง</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
          <span>จองแล้ว</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
          <span>ไม่ว่าง</span>
        </div>
      </div>

      {/* Time Selection */}
      {selectedDate && (
        <div className="border-t pt-4">
          <h4 className="text-lg font-semibold mb-2">
            เลือกเวลา - {selectedDate.toLocaleDateString('th-TH')}
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {getAvailableTimesForDate(selectedDate).map(time => (
              <button
                key={time}
                onClick={() => handleTimeSelect(time)}
                className={`
                  p-2 text-sm rounded-md border
                  ${selectedTime === time ? 'bg-blue-500 text-white border-blue-500' : 'bg-white hover:bg-gray-50 border-gray-300'}
                `}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Date/Time Summary */}
      {selectedDate && selectedTime && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>วันที่และเวลาที่เลือก:</strong><br />
            {selectedDate.toLocaleDateString('th-TH')} เวลา {selectedTime}
          </p>
        </div>
      )}
    </div>
  )
}