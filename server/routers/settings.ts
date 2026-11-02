import { z } from "zod";
import { getAllSettings, getSetting, upsertSetting } from "../db";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { isYouTubeUrl } from "@shared/youtube";
import { isValidBusinessOpportunitySlides } from "@shared/businessPromotion";

function validateSettingValue(key: string, value: string) {
  if (key === "promotion_video_url" && value.trim() && !isYouTubeUrl(value)) {
    throw new Error("Promotion video URL must be a valid YouTube link");
  }
  if (key === "business_opportunity_slides" && !isValidBusinessOpportunitySlides(value)) {
    throw new Error("Business Opportunity carousel data is invalid");
  }
}

export const settingsRouter = router({
  // Public: get public settings (shipping costs, site name)
  getPublic: publicProcedure.query(async () => {
    const all = await getAllSettings();
    return {
      siteName: all["site_name"] ?? "MCI One More",
      siteTagline: all["site_tagline"] ?? "Your Journey to Optimal Health Starts Here",
      shippingNationalCost: parseFloat(all["shipping_national_cost"] ?? "50000"),
      shippingInternationalCost: parseFloat(all["shipping_international_cost"] ?? "250000"),
      bankTransferBankName: all["bank_transfer_bank_name"] ?? "BCA",
      bankTransferBeneficiary: all["bank_transfer_beneficiary"] ?? "",
      bankTransferAccountNumber: all["bank_transfer_account_number"] ?? "",
      midtransClientKey: all["midtrans_client_key"] ?? "",
      midtransIsProduction: all["midtrans_is_production"] === "true",
      businessOpportunitySlides: all["business_opportunity_slides"] ?? "",
      promotionVideoUrl: all["promotion_video_url"] ?? "",
    };
  }),

  // Admin: get all settings
  adminGetAll: adminProcedure.query(async () => {
    return getAllSettings();
  }),

  // Admin: update a setting
  update: adminProcedure
    .input(
      z.object({
        key: z.string().min(1),
        value: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      validateSettingValue(input.key, input.value);
      await upsertSetting(input.key, input.value);
      return { success: true };
    }),

  // Admin: bulk update settings
  bulkUpdate: adminProcedure
    .input(
      z.object({
        settings: z.record(z.string(), z.string()),
      })
    )
    .mutation(async ({ input }) => {
      for (const [key, value] of Object.entries(input.settings)) {
        validateSettingValue(key, value);
        await upsertSetting(key, value);
      }
      return { success: true };
    }),
});
