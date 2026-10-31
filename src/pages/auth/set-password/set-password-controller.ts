import { useSetUserPassword } from "@/entities/session";

const useSetPasswordController = () => ({ mutation: useSetUserPassword() });

export default useSetPasswordController;
