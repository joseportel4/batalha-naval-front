import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { campaignService } from "@/services/campaignService";
import { ApiError } from "@/services/api";

export const useCampaignProgressQuery = () => {
  return useQuery({
    queryKey: ["campaignProgress"],
    queryFn: campaignService.getProgress,
  });
};

export const useStartCampaignMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: campaignService.startMatch,
    onSuccess: (data) => {
      // Invalida a query para manter a interface atualizada
      queryClient.invalidateQueries({ queryKey: ["campaignProgress"] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });

      if (typeof window !== "undefined") {
        localStorage.setItem("matchId", data.matchId);
        // Campanha usa sempre modo Clássico — armazena para evitar exibir painel Dinâmico
        localStorage.setItem(`gameMode_${data.matchId}`, "Classic");
      }
    },
    onError: (error: ApiError) => {
      console.error("Error starting campaign:", error);
    },
  });
};

export const useCancelCampaignMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (matchId: string) => campaignService.cancelMatch(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaignProgress"] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });

      if (typeof window !== "undefined") {
        localStorage.removeItem("matchId");
      }
    },
  });
};
