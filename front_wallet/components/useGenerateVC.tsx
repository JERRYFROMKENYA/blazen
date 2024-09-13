// `components/hooks/useGenerateVC.tsx`

import { useAuth } from "@/app/(auth)/auth";
import { usePocketBase } from "@/components/Services/Pocketbase";
import { generateVC } from "@/components/utils/user_details";
import {checkExistingVC} from "@/components/utils/vc_operations";

export function useGenerateVC() {
  const { user } = useAuth();
  const { pb } = usePocketBase();

  const handleGenerateVC = async () => {
    const existingVC = await checkExistingVC(user, pb, 'Ultimate Identity');
    if (existingVC) {
      return existingVC;
    }
    try {
      const result = await generateVC(user, pb);
      console.log(result);
    } catch (error) {
      // console.error(error);
    }
  };

  return { handleGenerateVC };
}