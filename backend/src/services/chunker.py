
def chunk_text(text: str, chunk_size: int = 500, chunk_overlap: int = 50) -> list[str]:
    # to avoid infinite loop eg: if both values are 100
    if chunk_overlap >= chunk_size:
        raise ValueError("chunk_overlap must be strictly less than chunk_size")
    # sliding window problem solving method
    start = 0
    chunk_list = []

    while start < len(text):
        # take a slice
        chunk = text[start: start + chunk_size]
        chunk_list.append(chunk.strip())
        # advance to next step
        start += (chunk_size - chunk_overlap)

    return chunk_list


# if __name__ == "__main__":
#         sample_text = (
#             "Brand Brain is an AI campaign copilot designed for marketing teams. "
#             "It ingests product catalogs and brand guidelines, converts them into 768-dimensional "
#             "vector embeddings, and saves them in Supabase pgvector. Marketers can generate multi-channel "
#             "campaigns in English and Arabic, and automate customer support replies with strict grounding."
#         )
        
#         # Test with small size so we can see the splits and overlaps clearly
#         results = chunk_text(sample_text, chunk_size=120, chunk_overlap=30)
#         print(f"Total chunks created: {len(results)}\n")
#         for i, c in enumerate(results):
#             print(f"--- Chunk {i} ({len(c)} chars) ---")
#             print(c)
