import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetAllOrganizations } from "@/entities/session";
import Cookies from "js-cookie";
import { useAuth } from "@/entities/session";
import { USER_ACCESS_KEY, authCookieOptions } from "@/shared/lib";
import { IOrganization } from "@/entities/organization";

const useOrganizationController = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const getAllOrganization = useGetAllOrganizations();

  const [organization, setOrganization] = useState<IOrganization[]>([]);
  const [editingOrganization, setEditingOrganization] = useState<IOrganization | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const navigateHome = (organizationId: string) => {
    // each school opens in the person's own role there
    const school =
      organization.find((w) => w.id === organizationId) ??
      getAllOrganization.data?.items.find((w) => w.id === organizationId);
    navigate(`/${organizationId}/${school?.myRole}`);
    Cookies.set(USER_ACCESS_KEY.ORGANIZATION_ID, organizationId, authCookieOptions(30));
    const workspaceName = organization.find((w) => w.id === organizationId)?.name || "";
    Cookies.set(USER_ACCESS_KEY.ORGANIZATION_NAME, workspaceName, authCookieOptions(30));
  };

  useEffect(() => {
    if (getAllOrganization.isSuccess && getAllOrganization.data) {
      if (getAllOrganization.data.items.length === 1 && !user?.isPlatformAdmin) {
        navigateHome(getAllOrganization.data.items[0].id);
      } else {
        setOrganization(getAllOrganization.data.items);
      }
    }
    //eslint-disable-next-line
  }, [getAllOrganization.isSuccess, getAllOrganization.data]);

  const signOut = () => {
    logout();
  };

  const filteredOrganizations = organization.filter((workspace) =>
    workspace.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  return {
    getAllOrganization,
    organization: filteredOrganizations,
    hasAnyOrganization: organization.length > 0,
    isLoading: getAllOrganization.isLoading,
    // a failed load shows an error with a retry, not an empty page
    loadError: getAllOrganization.isError ? getAllOrganization.error : null,
    retryLoad: () => getAllOrganization.refetch(),
    navigateHome,
    signOut,
    editingOrganization,
    openEditModal: (org: IOrganization) => setEditingOrganization(org),
    closeEditModal: () => setEditingOrganization(null),
    onOrganizationSaved: () => getAllOrganization.refetch(),
    searchTerm,
    setSearchTerm,
  };
};

export default useOrganizationController;
