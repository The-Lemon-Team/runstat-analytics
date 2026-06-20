"use client"

import * as React from "react"
import { PlusIcon } from "lucide-react"

import type { PublicationStatus } from "@/lib/dashboard-data"
import { PROVIDERS } from "@/lib/dashboard-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ProviderBadge } from "./provider-badge"

export type NewPublicationInput = {
  providerId: string
  label: string
  stageId: string
  url: string
  status: PublicationStatus
}

export type StageOption = {
  topicId: string
  topicName: string
  stageId: string
  stageName: string
}

export function AddPublicationDialog({
  open,
  onOpenChange,
  stageOptions,
  defaultStageKey,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  stageOptions: StageOption[]
  defaultStageKey?: string
  onSubmit: (topicId: string, input: NewPublicationInput) => void
}) {
  const [providerId, setProviderId] = React.useState("tg")
  const [label, setLabel] = React.useState("")
  const [stageKey, setStageKey] = React.useState(defaultStageKey ?? "")
  const [url, setUrl] = React.useState("")

  React.useEffect(() => {
    if (open) {
      const firstKey = stageOptions[0]
        ? `${stageOptions[0].topicId}::${stageOptions[0].stageId}`
        : ""
      setProviderId("tg")
      setLabel("")
      setStageKey(defaultStageKey ?? firstKey)
      setUrl("")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultStageKey])

  const selectedStage = stageOptions.find(
    (s) => `${s.topicId}::${s.stageId}` === stageKey,
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedStage) return
    const provider = PROVIDERS.find((p) => p.id === providerId)
    onSubmit(selectedStage.topicId, {
      providerId,
      label: label.trim() || provider?.name || providerId,
      stageId: selectedStage.stageId,
      url: url.trim(),
      status: url.trim() ? "published" : "scheduled",
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Publication</DialogTitle>
          <DialogDescription>
            Привяжите новый пост к этапу контента. Выберите площадку, укажите
            метку и вставьте ссылку.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel>Provider</FieldLabel>
              <Select value={providerId} onValueChange={setProviderId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Выберите площадку">
                    {(value: string) => {
                      const p = PROVIDERS.find((pr) => pr.id === value)
                      if (!p) return "Выберите площадку"
                      return (
                        <>
                          <ProviderBadge providerId={p.id} size="sm" />
                          {p.name}
                        </>
                      )
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {PROVIDERS.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        <ProviderBadge providerId={provider.id} size="sm" />
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="pub-label">Custom label</FieldLabel>
              <Input
                id="pub-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="например, VK Юрий"
              />
              <FieldDescription>
                Удобное имя слота для этой площадки.
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel>Stage</FieldLabel>
              <Select value={stageKey} onValueChange={setStageKey}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Выберите этап">
                    {(value: string) => {
                      const option = stageOptions.find(
                        (s) => `${s.topicId}::${s.stageId}` === value,
                      )
                      if (!option) return "Выберите этап"
                      return `${option.topicName} — ${option.stageName}`
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {stageOptions.map((option) => (
                      <SelectItem
                        key={`${option.topicId}::${option.stageId}`}
                        value={`${option.topicId}::${option.stageId}`}
                      >
                        {option.topicName} — {option.stageName}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="pub-url">Post URL</FieldLabel>
              <Input
                id="pub-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://"
              />
              <FieldDescription>
                Оставьте пустым, чтобы создать запланированный слот.
              </FieldDescription>
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-2">
            <DialogClose render={<Button variant="outline" type="button" />}>
              Отмена
            </DialogClose>
            <Button type="submit" disabled={!selectedStage}>
              <PlusIcon data-icon="inline-start" />
              Add Publication
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
