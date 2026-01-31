import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "./keys"
import * as settingsApi from "@/api/settings"

export function useSettingsQuery() {
  return useQuery({
    ...queryKeys.settings.user,
    queryFn: settingsApi.getSettings,
  })
}

export function useUpdateSettingsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: settingsApi.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries(queryKeys.settings.user)
    },
  })
}
