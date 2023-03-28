import { fetchMovies, Movie } from "@/lib/movies"
import { ColumnDef, flexRender, getCoreRowModel, PaginationState, useReactTable } from "@tanstack/react-table"
import { useMemo, useReducer, useState } from "react"
import { useQuery } from "react-query"

export default function MovieTable() {
  const rerender = useReducer(() => ({}), {})[1]

  const columns = useMemo<ColumnDef<Movie>[]>(
    () => [
      {
        header: () => <span>Name</span>,
        accessorKey: 'name',
        cell: info => info.getValue(),
        footer: props => props.column.id,
      },
      {
        cell: info => info.getValue(),
        accessorKey: 'releaseYear',
        header: () => <span>Release Year</span>,
        footer: props => props.column.id,
      },
      {
        cell: info => info.getValue(),
        accessorKey: 'director',
        header: () => <span>Director</span>,
        footer: props => props.column.id,
      },
    ],
    []
  )

  const [{ pageIndex, pageSize }, setPagination] =
    useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    })

  const fetchDataOptions = {
    pageIndex,
    pageSize,
  }

  const dataQuery = useQuery(
    ['data', fetchDataOptions],
    () => fetchMovies(fetchDataOptions),
    { keepPreviousData: true }
  )

  const defaultData = useMemo(() => [], [])

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  )

  const table = useReactTable({
    data: dataQuery.data?.rows ?? defaultData,
    columns,
    pageCount: dataQuery.data?.pageCount ?? -1,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    debugTable: true,
  })

  return (
    <div className="w-full">
      <table className="table w-full">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                return (
                  <th key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder ? null : (
                      <div>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </div>
                    )}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => {
            return (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => {
                  return (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="flex justify-between align-middle">
        <div>
          <span className="flex items-center gap-1">
            <div>Page</div>
            <strong>
              {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </strong>
          </span>
        </div>
        <div className="btn-group">
          <button
            className="btn"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {'<<'}
          </button>
          <button
            className="btn"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {'<'}
          </button>
          <button
            className="btn"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {'>'}
          </button>
          <button
            className="btn"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {'>>'}
          </button>
        </div>
        <div>
          <select
            value={table.getState().pagination.pageSize}
            onChange={e => {
              table.setPageSize(Number(e.target.value))
            }}
          >
            {[10, 20, 30, 40, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
          {dataQuery.isFetching ? 'Loading...' : null}
        </div>
      </div>
    </div>
  )
}