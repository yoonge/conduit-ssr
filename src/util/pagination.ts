export default (pathname: string, pageSize: number, total: number, current: number) => {
  let pageList = ''
  const totalPage = Math.ceil(total/pageSize)
  if (totalPage <= 1) {
    return pageList
  } else if (totalPage <= 9) {

    1 === current
      ? pageList += '<li class="page-item disabled"><a class="page-link">Previous</a></li>'
      : pageList += `<li class="page-item"><a class="page-link page-prev" href="#${current}">Previous</a></li>`
    for (let i = 1; i <= totalPage; i++) {
      i === current
        ? pageList += `<li class="page-item active"><a class="page-link" href="#">${i}</a></li>`
        : pageList += `<li class="page-item"><a class="page-link" href="${pathname}?page=${i}">${i}</a></li>`
    }
    totalPage === current
      ? pageList += '<li class="page-item disabled"><a class="page-link">Next</a></li>'
      : pageList += `<li class="page-item"><a class="page-link page-next" href="#${current}">Next</a></li>`
    return pageList

  } else {

    1 === current
      ? pageList += '<li class="page-item disabled"><a class="page-link">Previous</a></li>'
      : pageList += `<li class="page-item"><a class="page-link page-prev" href="#${current}">Previous</a></li>`

    if (current <= 5) {

      const j = current + 2 <= 5 ? 5 : current + 2
      for (let i = 1; i <= j; i++) {
        i === current
          ? pageList += `<li class="page-item active"><a class="page-link" href="#">${i}</a></li>`
          : pageList += `<li class="page-item"><a class="page-link" href="${pathname}?page=${i}">${i}</a></li>`
      }
      pageList += `
          <li class="page-item disabled"><a class="page-link">...</a></li>
          <li class="page-item"><a class="page-link" href="${pathname}?page=${totalPage}">${totalPage}</a></li>
          <li class="page-item"><a class="page-link page-next" href="#${current}">Next</a></li>
        `
      return pageList

    } else if (current >= (totalPage - 4)) {

      const j = current - 2 >= totalPage - 4  ? totalPage - 4 : current - 2
      pageList += `
          <li class="page-item"><a class="page-link" href="${pathname}?page=1">1</a></li>
          <li class="page-item disabled"><a class="page-link">...</a></li>
        `
      for (let i = j; i <= totalPage; i++) {
        i === current
          ? pageList += `<li class="page-item active"><a class="page-link" href="#">${i}</a></li>`
          : pageList += `<li class="page-item"><a class="page-link" href="${pathname}?page=${i}">${i}</a></li>`
      }
      totalPage === current
        ? pageList += '<li class="page-item disabled"><a class="page-link">Next</a></li>'
        : pageList += `<li class="page-item"><a class="page-link page-next" href="#${current}">Next</a></li>`
      return pageList

    } else {

      pageList += `
          <li class="page-item"><a class="page-link" href="${pathname}?page=1">1</a></li>
          <li class="page-item disabled"><a class="page-link">...</a></li>
        `
      for (let i = current - 2; i <= current + 2; i++) {
        i === current
          ? pageList += `<li class="page-item active"><a class="page-link" href="#">${i}</a></li>`
          : pageList += `<li class="page-item"><a class="page-link" href="${pathname}?page=${i}">${i}</a></li>`
      }
      pageList += `
          <li class="page-item disabled"><a class="page-link">...</a></li>
          <li class="page-item"><a class="page-link" href="${pathname}?page=${totalPage}">${totalPage}</a></li>
          <li class="page-item"><a class="page-link page-next" href="#${current}">Next</a></li>
        `
      return pageList

    }

  }
}
