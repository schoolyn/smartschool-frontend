// covers only the content area (<main>) while a whole page loads; for one card or table use Spinner
const PageLoader = () => {
  return (
    <div className="absolute inset-0 flex justify-center items-center bg-white/70 z-10">
      <div className="h-10 w-10 rounded-full border-2 border-gray-200 border-t-gray-800 animate-spin"></div>
    </div>
  );
};

export default PageLoader;
