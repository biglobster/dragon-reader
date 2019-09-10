export interface SearchResult {
    engine: string;
    title: string;
    url: string;
}

export interface Book {
    _id: string;    // 数据库标记
    title: string;  // 标题
    author: string; // 作者
    information?: BookInformation; // 信息
    sources?: Source[];
}

export interface BookInformation {
    title?: string;  // 标题
    author?: string; // 作者
    cover?: string; // 封面
    description?: string; // 描述
    category?: string; // 分类，例如玄幻
}

export interface ReadStatus {

}

export interface Source {
    url: string; // 目录页链接
    chapters: Chapter[]; // 章节列表
    latency: number;
}

export interface Chapter {
    title: string; // 章节名
    normlizeTitle?: string; // 标准化章节名
    url: string; // 链接
}