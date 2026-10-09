import {
  PlusIcon,
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  ArrowRightIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";

import Avatar from "@/components/avatar";
import LogoSpinner from "@/components/logo-spinner";
import { IOrganization } from "@/types";
import useOrganizationController from "./organization-controller";
import AddOrganizationModal from "./add-organization-modal";

const statusStyles: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  trial: "bg-gray-100 text-gray-800",
  suspended: "bg-red-100 text-red-800",
  churned: "bg-gray-100 text-gray-700",
};

function Organization() {
  const {
    organization,
    hasAnyOrganization,
    isLoading,
    navigateHome,
    signOut,
    isAddModalOpen,
    editingOrganization,
    openAddModal,
    openEditModal,
    closeAddModal,
    onOrganizationCreated,
    searchTerm,
    setSearchTerm,
  } = useOrganizationController();
  return (
    <>
      {isLoading ? (
        <LogoSpinner />
      ) : (
        <div className="min-h-screen bg-gray-50 font-sans">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
              <div>
                <h1 className="text-2xl font-semibold text-base-400">
                  Organizations
                </h1>
                <p className="text-sm text-base-600 mt-1">
                  Select an organization to view and manage its information
                  {hasAnyOrganization && (
                    <span className="text-gray-400"> · {organization.length} total</span>
                  )}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={openAddModal}
                  title="Add Organization"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Organization
                </button>
                <button
                  onClick={signOut}
                  title="Sign Out"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-base-400 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2 text-base-600" />
                  Sign Out
                </button>
              </div>
            </div>

            {hasAnyOrganization && (
              <div className="relative w-full sm:w-80 mb-8">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search organizations..."
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 shadow-sm focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            )}

            {!hasAnyOrganization ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200">
                <BuildingOffice2Icon className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No organizations yet
                </h3>
                <p className="text-sm text-gray-500 mb-6 text-center max-w-md">
                  Get started by adding the first school organization to the platform.
                </p>
                <button
                  onClick={openAddModal}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Organization
                </button>
              </div>
            ) : organization.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No organizations found
                </h3>
                <p className="text-sm text-gray-500 mb-6 text-center max-w-md">
                  No organizations match "{searchTerm}". Try a different search term.
                </p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {organization.map((workspace: IOrganization) => (
                  <div
                    key={workspace.id}
                    onClick={() => navigateHome(workspace.id)}
                    className="group bg-white shadow-sm rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 hover:border-primary-300"
                  >
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center min-w-0">
                          <Avatar name={workspace.name} src={workspace.logo?.url} size={48} />
                          <div className="ml-4 min-w-0">
                            <h3 className="text-lg font-semibold text-base-400 truncate">
                              {workspace.name}
                            </h3>
                            {workspace.address && (
                              <p className="flex items-center gap-1 text-xs text-base-600 mt-0.5 truncate">
                                <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
                                {workspace.address}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {workspace.status && (
                            <span
                              className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                                statusStyles[workspace.status] || "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {workspace.status}
                            </span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(workspace);
                            }}
                            title="Edit organization"
                            className="p-1.5 rounded-md text-gray-400 hover:text-primary-600 hover:bg-gray-100"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-5 space-y-3">
                      <div>
                        <p className="text-xs text-base-600 uppercase font-medium tracking-wide">
                          Description
                        </p>
                        <p className="text-sm text-base-400 mt-1">
                          {workspace.description || "No description provided"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-base-600 uppercase font-medium tracking-wide">
                          Code
                        </p>
                        <p className="text-sm text-base-400 font-mono mt-1">
                          {workspace.pincode}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                      <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-1 rounded-full">
                        {workspace.users.length} Users
                      </span>
                      <span className="flex items-center gap-1 text-xs font-medium text-primary-600 group-hover:text-primary-700">
                        Manage
                        <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      <AddOrganizationModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        onCreated={onOrganizationCreated}
        organization={editingOrganization}
      />
    </>
  );
}

export default Organization;
