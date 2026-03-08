import api from "./api";
import {
  CampaignProgressDto,
  StartCampaignMatchResponseDto,
} from "@/types/api-responses";

export const campaignService = {
  getProgress: async (): Promise<CampaignProgressDto> => {
    const { data } = await api.get("/campaign");
    return data;
  },

  startMatch: async (): Promise<StartCampaignMatchResponseDto> => {
    const { data } = await api.post("/campaign/start");
    return data;
  },

  cancelMatch: async (matchId: string): Promise<void> => {
    await api.post(`/match/${matchId}/cancel`);
  },
};
