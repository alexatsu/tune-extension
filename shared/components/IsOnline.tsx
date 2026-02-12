export function IsOnline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [wasPrevOffline, setWasPrevOffline] = useState(false)
  const [showTempBackOnline, setShowTempBackOnline] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setWasPrevOffline(true)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setWasPrevOffline(true)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (wasPrevOffline && isOnline) {
      setShowTempBackOnline(false)
      timeout = setTimeout(() => setShowTempBackOnline(true), 1000)
    }

    return () => {
      clearTimeout(timeout)
      setShowTempBackOnline(false)
    }
  }, [wasPrevOffline, isOnline])

  return (
    <>
      {!isOnline && (
        <div className="fixed bottom-0 left-0 right-0  bg-[#FF5151] text-black text-center z-50 animate-fadeIn text-sm">
          You are offline
        </div>
      )}

      {wasPrevOffline && isOnline && !showTempBackOnline && (
        <div className="fixed bottom-0 left-0 right-0  bg-[#60ff51] text-black text-center z-50 text-sm">
          Back online
        </div>
      )}

      {showTempBackOnline && (
        <div className="fixed bottom-0 left-0 right-0  bg-[#60ff51] text-black text-center z-50 animate-fadeOut text-sm">
          Back online
        </div>
      )}
    </>
  )
}
