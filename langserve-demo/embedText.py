
from langchain.document_loaders import PyPDFLoader,BSHTMLLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.embeddings.baichuan import BaichuanTextEmbeddings
from langchain.vectorstores import Chroma

def embedText(query, file_path):
    loader = BSHTMLLoader(file_path,open_encoding='utf-8')
    hcontent=loader.load_and_split()

    txtspliter=CharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
    )
    txt=txtspliter.split_documents(hcontent)


    embedmodel = BaichuanTextEmbeddings(
        api_key='REMOVED_EXPOSED_API_KEY',
    )
    vecstore = Chroma.from_documents(
        documents=txt,
        embedding=embedmodel,
        collection_name='openai_embed',
    )
    rasult=vecstore.similarity_search(query,k=3)
    preknowledge = [str(ras) for ras in rasult]
    promptcontent = f"""
    基于以下内容回答问题:
    内容:
    {preknowledge}
    问题: {query}
    """
    return promptcontent
    