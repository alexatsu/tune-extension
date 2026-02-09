export enum Providers {
  youtube = "youtube",
  soundcloud = "soundcloud",
  spotify = "spotify",
}

export type Provider = keyof typeof Providers

const providerRegexes: Record<Provider, RegExp> = {
  youtube: /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch|v|embed)|youtu\.be\/)/i,
  soundcloud: /^(?:https?:\/\/)?(www\.|m\.)?soundcloud\.com\//i,
  spotify: /^(?:https?:\/\/)?open\.spotify\.com\/(track|user|artist|album)\//i,
} as const

export const detectProvider = (url: string) => {
  return Object.entries(providerRegexes).find(([, regex]) => regex.test(url))?.[0] as Provider
}

export function useDetectProvider() {
  const [currentUrl, setCurrentUrl] = useState("")
  const [currentProvider, setCurrentProvider] = useState<Provider | undefined>(undefined)

  useEffect(() => {
    const updateUrl = async () => {
      try {
        const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
        if (tab?.url) {
          setCurrentUrl(tab.url)
          const provider = detectProvider(tab.url)
          setCurrentProvider(provider)
        }
      } catch (err) {
        console.error("Tab query failed:", err)
        setCurrentUrl("")
        setCurrentProvider(undefined)
      }
    }

    browser.tabs.onActivated.addListener(updateUrl)
    browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
      if (changeInfo.url) updateUrl()
    })

    updateUrl()
    return () => {
      browser.tabs.onActivated.removeListener(updateUrl)
      browser.tabs.onUpdated.removeListener(updateUrl)
    }
  }, [])

  return { currentProvider, currentUrl }
}
