import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Head from 'next/head'
import AuthModal from '../components/AuthModal'
import CalendarBooking from '../components/CalendarBooking'

export default function Home() {
  const { data: session } = useSession()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    serviceType: 'ตรวจสุขภาพช่องปาก',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [unavailableSlots, setUnavailableSlots] = useState([])
  const [services, setServices] = useState([])

  useEffect(() => {
    if (session) {
      // User is logged in, can create booking
    }
  }, [session])

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const response = await fetch('/api/availability')
        if (response.ok) {
          const data = await response.json()
          setUnavailableSlots(data)
        }
      } catch (error) {
        console.error('Error fetching availability:', error)
      }
    }
    fetchAvailability()
  }, [])

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/api/config')
        if (response.ok) {
          const config = await response.json()
          setServices(config.services || [])
        }
      } catch (error) {
        console.error('Error loading config:', error)
      }
    }
    loadConfig()
  }, [])

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    setError('')

    // Check if the selected date/time is available
    const isAvailable = !unavailableSlots.some(slot =>
      new Date(slot.date).toDateString() === new Date(formData.date).toDateString() &&
      slot.time === formData.time
    )

    if (!isAvailable) {
      setError('เวลานี้ถูกจองแล้ว กรุณาเลือกเวลาใหม่')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSuccess(true)
        setFormData({
          date: '',
          time: '',
          serviceType: 'ตรวจสุขภาพช่องปาก',
          notes: ''
        })
        // Refresh availability
        const availResponse = await fetch('/api/availability')
        if (availResponse.ok) {
          const data = await availResponse.json()
          setUnavailableSlots(data)
        }
      } else {
        throw new Error('Failed to create booking')
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      setError('เกิดข้อผิดพลาดในการสร้างการนัดหมาย')
    } finally {
      setLoading(false)
    }
  }
  return (
    <>
      <Head>
        <title>Smile Studio</title>
        <meta name="description" content="Professional dental care services" />
        <link rel="icon" href="data:image/x-icon;base64," />
        <link rel="preconnect" href="https://fonts.gstatic.com/" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?display=swap&family=Inter%3Awght%40400%3B500%3B700%3B900&family=Noto+Sans+Thai%3Awght%40400%3B500%3B700%3B900" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
      </Head>
      <div className="bg-gray-50">
        <div className="relative flex size-full min-h-screen flex-col bg-[#f8fbfc] group/design-root overflow-x-hidden" style={{fontFamily: 'Inter, "Noto Sans Thai", sans-serif'}}>
          <div className="layout-container flex h-full grow flex-col">
            <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7f0f3] bg-white/80 px-10 py-4 shadow-sm backdrop-blur-md">
              <div className="flex items-center gap-3 text-[#0d181b]">
                <svg className="text-[#11a3d4]" fill="none" height="32" viewBox="0 0 24 24" width="32" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.36 14.36C15.65 15.07 14.59 15.42 13.5 15.42C12.41 15.42 11.35 15.07 10.64 14.36C9.93 13.65 9.58 12.59 9.58 11.5C9.58 10.41 9.93 9.35 10.64 8.64C11.35 7.93 12.41 7.58 13.5 7.58C14.59 7.58 15.65 7.93 16.36 8.64C17.07 9.35 17.42 10.41 17.42 11.5C17.42 12.59 17.07 13.65 16.36 14.36Z" fill="currentColor"></path>
                </svg>
                <h2 className="text-[#0d181b] text-xl font-bold leading-tight tracking-[-0.015em]">Smile Studio</h2>
              </div>
              <nav className="flex items-center gap-8">
                <a className="text-gray-600 hover:text-[#11a3d4] text-base font-medium leading-normal transition-colors" href="#home">หน้าแรก</a>
                <a className="text-gray-600 hover:text-[#11a3d4] text-base font-medium leading-normal transition-colors" href="#services">บริการของเรา</a>
                <a className="text-gray-600 hover:text-[#11a3d4] text-base font-medium leading-normal transition-colors" href="#about">เกี่ยวกับเรา</a>
                <a className="text-gray-600 hover:text-[#11a3d4] text-base font-medium leading-normal transition-colors" href="#reviews">ความคิดเห็น</a>
                <a className="text-gray-600 hover:text-[#11a3d4] text-base font-medium leading-normal transition-colors" href="#contact">ติดต่อเรา</a>
              </nav>
              <div className="flex items-center gap-3">
                {session ? (
                  <>
                    <span className="text-gray-700">Welcome, {session.user.name || session.user.email}</span>
                    <button onClick={() => signOut({ callbackUrl: window.location.origin + '/' })} className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded">
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <a className="flex min-w-[100px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-md h-11 px-5 bg-[#11a3d4] text-white text-base font-bold leading-normal tracking-wide shadow-sm hover:bg-[#0f92bb] transition-colors" href="#contact">
                      <span className="truncate">นัดหมาย</span>
                    </a>
                    <button onClick={() => setShowAuthModal(true)} className="flex min-w-[100px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-md h-11 px-5 bg-gray-100 text-gray-800 text-base font-bold leading-normal tracking-wide border border-gray-200 hover:bg-gray-200 transition-colors">
                      <span className="truncate">เข้าสู่ระบบ</span>
                    </button>
                  </>
                )}
              </div>
            </header>
            <main className="flex-1">
              <section className="relative" id="home">
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="flex min-h-[520px] items-center justify-center bg-cover bg-center bg-no-repeat" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBk07ovTWPCXvTj61p3TfRn5MotQQGb-MuJaq5PhI6TyECFfCUr2riXtcui9mfRc6s-zTiKXmP6LMgLwuz4DfuLRom9zOoPHaqPGK3WuIvNVu1dlq02LNgFtiBDIMoNYT7wGX5nZkAO4SZMdJoXw-e3wfVtfIEAZCnkPl9WFVX-8LTnLr7W-KKKHp2-BLEDwb2DfgWi0kquvx7TY586gRAMPgv5UnmgPQpmsZ9L7ET4YxaXJSBmfhfYVTPAfklhGxpf3Fk2prSHAMk")'}}>
                  <div className="relative z-10 mx-auto max-w-4xl px-4 text-center text-white">
                    <h1 className="text-4xl font-black leading-tight tracking-tight md:text-6xl"> ยินดีต้อนรับสู่ Smile Studio </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg font-light md:text-xl"> ทีมทันตแพทย์ผู้เชี่ยวชาญของเราพร้อมมอบรอยยิ้มที่สดใสและสุขภาพดีให้กับคุณ </p>
                    <a className="mt-8 flex min-w-[120px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-md h-12 px-6 bg-[#11a3d4] text-white text-lg font-bold leading-normal tracking-wide shadow-lg hover:bg-[#0f92bb] transition-transform transform hover:scale-105 mx-auto" href="#contact">
                      <span className="truncate">นัดหมายทันที</span>
                    </a>
                  </div>
                </div>
              </section>
              <section className="py-16 sm:py-24 bg-gray-50" id="services">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">บริการทันตกรรมครบวงจร</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500">เราให้บริการทันตกรรมที่หลากหลายเพื่อตอบสนองทุกความต้องการของคุณ ตั้งแต่การดูแลป้องกันไปจนถึงทันตกรรมเพื่อความงาม</p>
                  </div>
                  <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="group">
                      <div className="relative overflow-hidden rounded-lg shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        <div className="w-full h-64 bg-center bg-no-repeat bg-cover" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAAPESp0YgtaXkwydaEhDgzc4b93TdlN0KwBvP0HbXyrU6DI2izhQiVJhX8mIjxAOGBXCoFD1okjarcWcO8QTEH5yVwwIgna21LG3EeQIUSpV-MD5jefKV4Kifj3-nlgBTHm5yEOdtdj_9l7p61L7fdXsDU_Wg2zUYOH19cYbKA-zOI2gbRVFpd7kcrMiTqDWMl6DZN0Owi3Xszoc70WgITxklTYmaCqIcQPdC486oRrUDP0_cRHYf72qPG0HkEZS3T56m-alHsg7g")'}}></div>
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                      </div>
                      <div className="mt-4">
                        <h3 className="text-lg font-semibold text-gray-900">ตรวจสุขภาพช่องปาก</h3>
                        <p className="mt-2 text-base text-gray-600">การตรวจสุขภาพเป็นสิ่งสำคัญเพื่อรักษาสุขภาพที่ดีและสร้างรอยยิ้มที่สวยงาม</p>
                      </div>
                    </div>
                    <div className="group">
                      <div className="relative overflow-hidden rounded-lg shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        <div className="w-full h-64 bg-center bg-no-repeat bg-cover" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDAg6zLJ2X1TePdgrZAsUKXtyNZDKVwhHJo229AHFZLvZcrn1AhjWZG9N8meoxJtCeE8ZDGKNI1UjWbQWezbd1NsOQ9YMZLRx6bv_miUzjg2hNrm502V8B0tY68kg47u6iMqtSBm3zw65qOd_GBuCVhq5F99ZUsj8jMn1IsZccp84lu9JDlH0rQ5gXgiA9VfE1gsV4CmttCPLH4yp6IVqxIY8UTND9QJtjDjAR9JrDe-sLDBUbLMz5jOZVOQQvBAA5z_PVuBRMDq1k")'}}></div>
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                      </div>
                      <div className="mt-4">
                        <h3 className="text-lg font-semibold text-gray-900">ขูดหินปูนและทำความสะอาด</h3>
                        <p className="mt-2 text-base text-gray-600">การทำความสะอาดแบบมืออาชีพเพื่อสุขภาพช่องปากที่ดีที่สุด</p>
                      </div>
                    </div>
                    <div className="group">
                      <div className="relative overflow-hidden rounded-lg shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        <div className="w-full h-64 bg-center bg-no-repeat bg-cover" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAcDJUqMxkMpV8LkcATmKlEMN4naeP7sbM7t5Vm6QoGVj91mRv6-hVgIriDa1XvFRkONB3QGr_ZSsBpR8fadKA_oqBbbmbknlXc9oy-N7LfynZ_SScuQn7qJKKpm5ND4KoEfG_LrmOjHnlNNw_HJo3vTXz-GaWcb0NTj4JlNhmQ7hyE2te3wePNm-GYlI2pvKbXG1Oq7vE51u1X0U_TIIk2KqCSO36AonLRwYj1Vt46xhbUFH_ygopZnm2aWfUTlfggVmE9Nz2GC7o")'}}></div>
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                      </div>
                      <div className="mt-4">
                        <h3 className="text-lg font-semibold text-gray-900">อุดฟันป้องกัน</h3>
                        <p className="mt-2 text-base text-gray-600">การป้องกันฟันผุและโรคเหงือกด้วยการอุดฟัน</p>
                      </div>
                    </div>
                    <div className="group">
                      <div className="relative overflow-hidden rounded-lg shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        <div className="w-full h-64 bg-center bg-no-repeat bg-cover" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA5T57Wd8RGYzf1p7fEUwsk7Qn6M5cmol_8oG5gR1GD3z5SveHEhPSAxxMcGUdg8sWOY2ZU-CRoG_4GwpyuJXgmJGeyI6RV1bRqyn_QPuGDkzSTlM8_q6uROddIJaxCtN40YvxYXC-GvsE_3LwdV__8ebY8y5dyE5qOXQvsPSqTF7yP2Sw-8N5e8z_k2JqR7MIIEjMI5gYl55yfKZv33eDFqQZSy20FTBrWOHbUkDXd-IC-e68fYDvFByVh_SoCL93bsAMXP1jc0n0")'}}></div>
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                      </div>
                      <div className="mt-4">
                        <h3 className="text-lg font-semibold text-gray-900">ถอนฟัน</h3>
                        <p className="mt-2 text-base text-gray-600">การถอนฟันที่เสียหายหรือไม่สามารถรักษาได้</p>
                      </div>
                    </div>
                    <div className="group">
                      <div className="relative overflow-hidden rounded-lg shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        <div className="w-full h-64 bg-center bg-no-repeat bg-cover" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDBtNVbOzxxEW1yPuOtjbtz7mjPcUt3hRAGxC0tzhMX2S9Xo8NWjaU7H-YUrTRmE3hX9aJutlkVP_j_h9acsSev_ovSefxy_BepC4qX-GTSw9i1RJQHQX_3B6u_L4vxAFr4H_lvFzZhUCsGT0c6qFeklAD5BmnJ1iKi83Aoo-0odRplBgULTkpx5DAQG1NX2YIZgvSAp23T9udN2qbpl79rCJKBiZ7-kxEdYOc-LzVyNxK0xPCfrORQKdi0e0anIjVJUJeCd8phCs8")'}}></div>
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                      </div>
                      <div className="mt-4">
                        <h3 className="text-lg font-semibold text-gray-900">ทำความสะอาดฟันเทียม</h3>
                        <p className="mt-2 text-base text-gray-600">การทำความสะอาดฟันปลอมและฟันเทียมอื่นๆ</p>
                      </div>
                    </div>
                    <div className="group">
                      <div className="relative overflow-hidden rounded-lg shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        <div className="w-full h-64 bg-center bg-no-repeat bg-cover" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDfRm3cVf7Hiiw5F9ouOICXqzEdP2Kt357tIPgR0_ZWvIzecVrjZnPeXfYKLa-lAlUa_NSukCa9c_VWCYcuhDE43BFfmtTjuOAqpVU1xMyRGSEfDjKIOFRMAVLIFcNbKRFmklWS7gBL0u3GQXbWRaFO-0k0B9zmbfiN__Ft9f-bEC9aZHJFGrXqn_wTWPyWvGFGhAA7YudW_k9JWTrBTONG5gnRkhBUeQ9f1lvGEa738BWZ_Q50pNlgMyqHuoHxfkrw_rVvTgs4AS8")'}}></div>
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                      </div>
                      <div className="mt-4">
                        <h3 className="text-lg font-semibold text-gray-900">ถอนฟันคุด</h3>
                        <p className="mt-2 text-base text-gray-600">การถอนฟันคุดเพื่อป้องกันปัญหาในอนาคต</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              <section className="py-16 sm:py-24 bg-white" id="about">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">เกี่ยวกับ Smile Studio</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500">เรามุ่งมั่นที่จะมอบประสบการณ์ทันตกรรมที่ดีที่สุดในบรรยากาศที่เป็นมิตรและสะดวกสบาย</p>
                  </div>
                  <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    <div className="flex flex-col items-center text-center p-6 rounded-lg border border-gray-200 bg-gray-50 hover:shadow-lg transition-shadow">
                      <span className="material-symbols-outlined text-5xl text-[#11a3d4]">health_and_safety</span>
                      <h3 className="mt-4 text-xl font-bold text-gray-900">ทันตแพทย์ผู้เชี่ยวชาญ</h3>
                      <p className="mt-2 text-base text-gray-600">ทีมงานของเราประกอบด้วยทันตแพทย์ที่มีประสบการณ์และความรู้ความสามารถสูง</p>
                    </div>
                    <div className="flex flex-col items-center text-center p-6 rounded-lg border border-gray-200 bg-gray-50 hover:shadow-lg transition-shadow">
                      <span className="material-symbols-outlined text-5xl text-[#11a3d4]">verified</span>
                      <h3 className="mt-4 text-xl font-bold text-gray-900">เทคโนโลยีที่ทันสมัย</h3>
                      <p className="mt-2 text-base text-gray-600">เราใช้เครื่องมือและเทคโนโลยีที่ทันสมัยเพื่อให้การรักษามีประสิทธิภาพและสะดวกสบาย</p>
                    </div>
                    <div className="flex flex-col items-center text-center p-6 rounded-lg border border-gray-200 bg-gray-50 hover:shadow-lg transition-shadow">
                      <span className="material-symbols-outlined text-5xl text-[#11a3d4]">schedule</span>
                      <h3 className="mt-4 text-xl font-bold text-gray-900">บริการที่สะดวกสบาย</h3>
                      <p className="mt-2 text-base text-gray-600">คลินิกของเราตั้งอยู่ในทำเลที่เดินทางสะดวกและมีบรรยากาศที่ผ่อนคลาย</p>
                    </div>
                  </div>
                </div>
              </section>
              <section className="py-16 sm:py-24 bg-gray-50" id="reviews">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">เสียงตอบรับจากคนไข้ของเรา</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500">ความพึงพอใจของคนไข้คือสิ่งที่เราภาคภูมิใจที่สุด</p>
                  </div>
                  <div className="mt-16 grid gap-12 lg:grid-cols-3">
                    <div className="flex flex-col items-center text-center p-8 rounded-xl border border-gray-200 bg-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                      <img alt="Patient photo" className="h-24 w-24 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdHPH0niClew3Ye-wp0KHt--PQEKJjG8igO9QB-1zGt-5D3yxWsxJexNzZpezrKnwUv6qCzvgO4esiyfeBjQEIuo_kzbrZgucIY-XtS8aacOcfItuKIbu3XzCTJ35lgZu_BqtgzeKxJUSwLxrIrm1c_Szbby2Cu48enc4kxwDDjM7LMlZrJrYVSba1eevusbcDO-zyEXWJl0-kkcIGGklWaoz_gYA06cMWPAACMzOpsDuXOptZhIMesNLLNGmuzkaVPhN9o_isHY4"/>
                      <blockquote className="mt-6 text-gray-700">
                        <p>"คุณหมอและทีมงานใจดีมากค่ะ ให้คำแนะนำดีมากๆ บรรยากาศในคลินิกก็สะอาดและผ่อนคลาย ไม่รู้สึกกลัวการทำฟันเลยค่ะ"</p>
                      </blockquote>
                      <cite className="mt-4 font-bold text-gray-900">สมศรี ใจดี</cite>
                    </div>
                    <div className="flex flex-col items-center text-center p-8 rounded-xl border border-gray-200 bg-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                      <img alt="Patient photo" className="h-24 w-24 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsR2XBidF6nPO_5Gm1JcADFSKon4s6wOcYR9zwpiRFmjpeMZ93q7ZtLbQEXC7t9et5SPdrviee3EGqnqdHsEupcfxAKqD-C-TbxSdqMyeMiquhHkwq2TttTdF_1ib-aaIc8s8R_LpJcXA6E4yqzoG4iqcZSuedaDsm7I8pZAOpiTP2Op6kYxlypCGcX45ikq4QCo1bZGY3OhZHa8jC5YVdeQdAbYEidhQhh4OyQD8EVkbTKzxOjc_ppzOrZdJxuILkPAN8-AMu3xw"/>
                      <blockquote className="mt-6 text-gray-700">
                        <p>"ประทับใจในเทคโนโลยีที่ทันสมัยของที่นี่มากครับ การรักษาเป็นไปอย่างรวดเร็วและไม่เจ็บเลย ผลลัพธ์ก็ออกมาดีเยี่ยม"</p>
                      </blockquote>
                      <cite className="mt-4 font-bold text-gray-900">สมชาย มุ่งมั่น</cite>
                    </div>
                    <div className="flex flex-col items-center text-center p-8 rounded-xl border border-gray-200 bg-white shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                      <img alt="Patient photo" className="h-24 w-24 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDcM3pwcbkYqeUzJ4PWgWIRmlS2cjrdQUawtwdfi886BjxEbxks_QHtljUj7_cAKc1K01RLlwnhKt1mDKphQjWTT0NyNPWD5K1Wzfysm-fPpMi4kUC5UpMGVo70pop7LWM6O1GS7nLsSFjSKJpy9qgbupxntUx7SiHvQf7Ikuh1U1lLRiU1VG9ZXMLD0rMxQdxY23j7jcRcbApsF-z2dr7UgRWVhLjgwY0_zv4ySL3Al4WFdaPOZWYDd2W7USM5Es7obJdx4qUzpxw"/>
                      <blockquote className="mt-6 text-gray-700">
                        <p>"การบริการดีเยี่ยมตั้งแต่ก้าวแรกที่เข้ามาเลยครับ พนักงานต้อนรับให้ข้อมูลชัดเจน การนัดหมายก็สะดวกสบายมากๆ ครับ"</p>
                      </blockquote>
                      <cite className="mt-4 font-bold text-gray-900">สมศักดิ์ รักบริการ</cite>
                    </div>
                  </div>
                </div>
              </section>
              <section className="py-16 sm:py-24 bg-white" id="contact">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-24">
                    <div>
                      <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">ติดต่อเราและนัดหมาย</h2>
                      <p className="mt-4 text-lg text-gray-500">เราพร้อมให้คำปรึกษาและดูแลสุขภาพช่องปากของคุณ กรุณากรอกแบบฟอร์มเพื่อทำการนัดหมาย หรือติดต่อเราผ่านช่องทางด้านล่าง</p>
                      <div className="mt-8 space-y-4">
                        <div className="flex items-center gap-4">
                          <span className="material-symbols-outlined text-3xl text-[#11a3d4]">location_on</span>
                          <p className="text-lg text-gray-700">123 ถนนสุขุมวิท, คลองเตย, กรุงเทพมหานคร 10110</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="material-symbols-outlined text-3xl text-[#11a3d4]">call</span>
                          <p className="text-lg text-gray-700">(02) 123-4567</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="material-symbols-outlined text-3xl text-[#11a3d4]">email</span>
                          <p className="text-lg text-gray-700">contact@smilestudio.th</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-8 shadow-lg">
                      <h3 className="text-2xl font-bold text-gray-900">แบบฟอร์มนัดหมาย</h3>
                      {session ? (
                        <div className="mt-6 space-y-6">
                          <CalendarBooking
                            onDateTimeSelect={(dateTime) => {
                              setFormData(prev => ({
                                ...prev,
                                date: dateTime.date,
                                time: dateTime.time
                              }))
                              setError('')
                              setSuccess(false)
                            }}
                            selectedService={formData.serviceType}
                          />

                          <div>
                            <label className="block text-sm font-medium text-gray-700" htmlFor="serviceType">บริการที่สนใจ</label>
                            <select
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#11a3d4] focus:ring-[#11a3d4] sm:text-sm"
                              id="serviceType"
                              name="serviceType"
                              value={formData.serviceType}
                              onChange={(e) => {
                                setFormData(prev => ({ ...prev, serviceType: e.target.value }))
                                setError('')
                                setSuccess(false)
                              }}
                              required
                            >
                              <option value="">เลือกบริการ</option>
                              {services.map(service => (
                                <option key={service.id} value={service.name}>
                                  {service.name} - {service.price} บาท ({service.duration} นาที)
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700" htmlFor="notes">ข้อความเพิ่มเติม</label>
                            <textarea
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#11a3d4] focus:ring-[#11a3d4] sm:text-sm"
                              id="notes"
                              name="notes"
                              rows="4"
                              value={formData.notes}
                              onChange={(e) => {
                                setFormData(prev => ({ ...prev, notes: e.target.value }))
                                setError('')
                                setSuccess(false)
                              }}
                            ></textarea>
                          </div>
                          <div>
                            {error && <p className="text-red-600 mb-2">{error}</p>}
                            {success && <p className="text-green-600 mb-2">การนัดหมายสำเร็จ!</p>}
                            <button
                              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-[#11a3d4] hover:bg-[#0f92bb] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#11a3d4]"
                              type="button"
                              onClick={handleFormSubmit}
                              disabled={loading || !formData.date || !formData.time}
                            >
                              {loading ? 'กำลังส่ง...' : 'ส่งข้อความ'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-6 text-gray-600">กรุณาเข้าสู่ระบบเพื่อทำการนัดหมาย</p>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </main>
            <footer className="bg-[#0d181b] text-white">
              <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <svg className="text-[#11a3d4]" fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.36 14.36C15.65 15.07 14.59 15.42 13.5 15.42C12.41 15.42 11.35 15.07 10.64 14.36C9.93 13.65 9.58 12.59 9.58 11.5C9.58 10.41 9.93 9.35 10.64 8.64C11.35 7.93 12.41 7.58 13.5 7.58C14.59 7.58 15.65 7.93 16.36 8.64C17.07 9.35 17.42 10.41 17.42 11.5C17.42 12.59 17.07 13.65 16.36 14.36Z" fill="currentColor"></path>
                    </svg>
                    <h2 className="text-lg font-bold">Smile Studio</h2>
                  </div>
                  <p className="text-gray-400 text-sm">© 2023 Smile Studio. All rights reserved.</p>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  )
}
