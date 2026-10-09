const Footer = () => {
  return (
    <footer className="bg-white shadow-sm z-10">
      <div className="w-full px-4">
        <div className="flex justify-end items-center">
          <div className="flex space-x-4">
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} Opscul. All rights reserved.
            </div>

            <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
