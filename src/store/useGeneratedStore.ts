import { create } from "zustand";
import { ImageGenerationFormSchema } from "@/components/image-generation/Configurations";
import { z } from "zod";
import { generateImageAction, storeImages } from "@/app/actions/image-actions";
import { toast } from "sonner";

interface GenerateState {
  loading: boolean;
  images: Array<{ url: string }>;
  error: string | null;
  generateImage: (values: z.infer<typeof ImageGenerationFormSchema>) => Promise<void>
}

const useGeneratedStore = create<GenerateState>((set) => ({
  loading: false,
  images: [],
  error: null,

  generateImage: async (values: z.infer<typeof ImageGenerationFormSchema>) => {
    set({ loading: true, error: null });

    const toastId = toast.loading("Generating image...")

    try {
      console.log("generating image");
      const { error, success, data } = await generateImageAction(values);
      console.log(
        "image generation finished!, success: ",
        success,
        " data: ",
        data,
        " error: ",
        error
      );

      if (!success) {
        toast.error(`Generate image failed. Problem: ${error || "Unknown error"}`);
        set({ error: error, loading: false });
        return;
      }

      const dataWithUrl = data.map((url:string) => {
        return {
            url,
            ...values
        }
      })

      set({ images: dataWithUrl, loading: false });
      toast.success("Image generated successfully!", {id: toastId})

      await storeImages(dataWithUrl)
      toast.success("Image stored successfully!", {id: toastId})

    } catch (error) {
      console.error(error);
      set({
        error: "Failed to generate image. Please try again.",
        loading: false,
      });
    }
  },
}));

export default useGeneratedStore;
