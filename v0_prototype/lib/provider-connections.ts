import { getProvider, type Provider } from "@/lib/dashboard-data"

/** Social networks the agency can authorize for live audience tracking. */
export type ConnectableProvider = {
  id: string
  /** baseline subscriber count used to seed the live counter */
  baseSubscribers: number
  /** rough per-tick growth band used to simulate live activity */
  drift: [number, number]
  handle: string
}

export const CONNECTABLE_PROVIDERS: ConnectableProvider[] = [
  { id: "vk", baseSubscribers: 124300, drift: [-2, 9], handle: "vk.com/studio.s10" },
  { id: "youtube", baseSubscribers: 89200, drift: [0, 14], handle: "@studio-s10" },
  { id: "instagram", baseSubscribers: 215800, drift: [-4, 18], handle: "@studio.s10" },
]

export function getConnectable(id: string): ConnectableProvider | undefined {
  return CONNECTABLE_PROVIDERS.find((p) => p.id === id)
}

export function providerOf(id: string): Provider {
  return getProvider(id)
}
