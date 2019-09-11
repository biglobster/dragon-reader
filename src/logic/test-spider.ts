async function main() {
    // const book = await new Spider().fetchBook('大主宰');
    // console.log(book);
    // console.log(book.sources[0].chapters.slice(0, 10).map(chapter => chapter.title).join('\n')
    //     + '\n...\n'
    //     + book.sources[0].chapters.slice(-11, -1).map(chapter => chapter.title).join('\n'));
    // console.log(await fetchContent('http://www.shicimingju.com/book/sanguoyanyi/1.html'));
}

main().catch(e => console.warn(e));
