import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Document } from "@langchain/core/documents";
import { OpenAIEmbeddings } from "@langchain/openai";

const retrieverCache: Record<string, ReturnType<MemoryVectorStore["asRetriever"]>> = {};

// Index and retrieve all content, no filtering
export async function docsQuery(csvPath: string, prompt: string, column: string = "content") {
  const cacheKey = `${csvPath}:${prompt}:${column}`;
  if (retrieverCache[cacheKey]) return retrieverCache[cacheKey];

  const loader = new CSVLoader(csvPath, { columns: true });
  const docs = await loader.load();

  // No filtering, use all docs
  const taggedDocs = docs.map(
    (doc) =>
      new Document({
        pageContent: doc.pageContent,
        metadata: { source: csvPath, ...doc.metadata },
      })
  );

  const splitter = new RecursiveCharacterTextSplitter();
  const splitDocs = await splitter.splitDocuments(taggedDocs);

  const embeddings = new OpenAIEmbeddings();
  const vectorstore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);

  const retriever = vectorstore.asRetriever();
  retrieverCache[cacheKey] = retriever;
  return retriever;
}