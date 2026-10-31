import { useCallback, useState } from "react";

// page and page size for a server-paged list; a new size starts again from page 1
const usePaging = (initialSize = 20) => {
  const [page, setPage] = useState(1);
  const [pageSize, setSize] = useState(initialSize);

  const setPageSize = useCallback((size: number) => {
    setSize(size);
    setPage(1);
  }, []);
  const resetPage = useCallback(() => setPage(1), []);

  return { page, pageSize, setPage, setPageSize, resetPage };
};

export default usePaging;
