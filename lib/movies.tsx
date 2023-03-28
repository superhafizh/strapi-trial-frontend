export type Movie = {
  id: number
  name: string
  releaseYear: number
  director: string
}

export async function fetchMovies(options: {
  pageIndex: number
  pageSize: number
}) {
  const url = `http://localhost:1337/api/movies?populate[0]=director&pagination[page]=${options.pageIndex+1}&pagination[pageSize]=${options.pageSize}`
  const response = (await (await fetch(url)).json())
  const rows = response.data
  const meta = response.meta

  let movies = []

  if (rows.length > 1) {
    for(let i = 0;i < rows.length; i++) {
      let row = rows[i]
      let rowData = row.attributes

      movies.push({
        id: row.id,
        name: rowData.name,
        releaseYear: rowData.releaseYear,
        director: rowData.director.data.attributes.name
      } as Movie)
    }
  }

  return {
    rows: movies,
    pageCount: meta.pagination.pageCount,
  }
}