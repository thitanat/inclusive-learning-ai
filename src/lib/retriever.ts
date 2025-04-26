import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Document } from "@langchain/core/documents";
import { OpenAIEmbeddings } from "@langchain/openai";

const retrieverCache: Record<string, ReturnType<MemoryVectorStore["asRetriever"]>> = {};

export async function getRetrieverFrom(pdfPath: string) {
  if (retrieverCache[pdfPath]) return retrieverCache[pdfPath];

  const loader = new PDFLoader(pdfPath);
  const docs = await loader.load();

  const taggedDocs = docs.map(
    (doc) =>
      new Document({
        pageContent: doc.pageContent,
        metadata: { source: pdfPath },
      })
  );

  const splitter = new RecursiveCharacterTextSplitter();
  const splitDocs = await splitter.splitDocuments(taggedDocs);

  const embeddings = new OpenAIEmbeddings();
  const vectorstore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);

  const retriever = vectorstore.asRetriever();
  retrieverCache[pdfPath] = retriever;
  return retriever;
}