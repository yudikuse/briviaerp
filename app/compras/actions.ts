"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";

function parseMoney(value: FormDataEntryValue | null): number {
  if (!value) return 0;
  const cleaned = String(value).trim().replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function parseDecimal(value: FormDataEntryValue | null): number {
  if (!value) return 0;
  const cleaned = String(value).trim().replace(/\s/g, "").replace(/\./g, "").replace(",", ".").replace(/[^0-9.]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export async function getNextCode(): Promise<string> {
  const { data } = await supabaseAdmin
    .from("products")
    .select("codigo")
    .like("codigo", "BRV-%")
    .order("codigo", { ascending: false })
    .limit(1)
    .single();

  let next = 1;
  if (data?.codigo) {
    const match = data.codigo.match(/BRV-(\d+)/);
    if (match) next = parseInt(match[1]) + 1;
  }
  return `BRV-${String(next).padStart(3, "0")}`;
}

async function uploadFoto(file: File, codigo: string): Promise<string | null> {
  try {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${codigo}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await supabaseAdmin.storage
      .from("product-images")
      .upload(fileName, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: true,
      });

    if (error) {
      console.error("Storage upload error:", error.message);
      return null;
    }

    const { data } = supabaseAdmin.storage
      .from("product-images")
      .getPublicUrl(fileName);

    return data.publicUrl ?? null;
  } catch (err) {
    console.error("uploadFoto error:", err);
    return null;
  }
}

export async function savePurchase(formData: FormData) {
  const codigo = String(formData.get("codigo") ?? "").trim();
  const nome = String(formData.get("nome") ?? "").trim();
  const categoria = String(formData.get("categoria") ?? "").trim();
  const cor = String(formData.get("cor") ?? "").trim();
  const tamanho = String(formData.get("tamanho") ?? "").trim();
  const fornecedor = String(formData.get("fornecedor") ?? "").trim();
  const dataCcompra = String(formData.get("data_compra") ?? "").trim() || new Date().toISOString().slice(0, 10);
  const quantidade = parseInt(String(formData.get("quantidade") ?? "1")) || 1;
  const custoUnitario = parseMoney(formData.get("custo_unitario"));
  const markupX = parseDecimal(formData.get("markup_x"));
  const margemPct = parseDecimal(formData.get("margem_pct"));
  const impostosPct = parseDecimal(formData.get("impostos_pct"));
  const cartaoPct = parseDecimal(formData.get("cartao_pct"));
  const marketingPct = parseDecimal(formData.get("marketing_pct"));
  const outrasPct = parseDecimal(formData.get("outras_pct"));
  const embalagemRs = parseDecimal(formData.get("embalagem_rs"));
  const pecaRs = parseDecimal(formData.get("peca_rs"));
  const precoSugerido = parseDecimal(formData.get("preco_sugerido"));
  const precoFinal = parseDecimal(formData.get("preco_final"));

  // handle foto upload
  const fotoFile = formData.get("foto");
  let fotoUrl: string | null = null;
  if (fotoFile instanceof File && fotoFile.size > 0) {
    fotoUrl = await uploadFoto(fotoFile, codigo);
  }

  const { data: existing } = await supabaseAdmin
    .from("products")
    .select("id, foto_url")
    .eq("codigo", codigo)
    .single();

  let productId: string;

  if (existing?.id) {
    productId = existing.id;

    const updatePayload: Record<string, unknown> = {
      preco_sugerido: precoSugerido,
      preco_atual: precoFinal,
      markup_x: markupX || null,
      margem_desejada_pct: margemPct || null,
      impostos_pct: impostosPct,
      taxa_cartao_pct: cartaoPct,
      marketing_pct: marketingPct,
      outras_deducoes_pct: outrasPct,
      embalagem_rs: embalagemRs,
      despesa_peca_rs: pecaRs,
      custo_unitario: custoUnitario,
      fornecedor,
      updated_at: new Date().toISOString(),
    };

    if (fotoUrl) updatePayload.foto_url = fotoUrl;

    await supabaseAdmin.from("products").update(updatePayload).eq("id", productId);
  } else {
    const { data: inserted, error } = await supabaseAdmin
      .from("products")
      .insert({
        codigo,
        nome,
        categoria: categoria || null,
        cor: cor || null,
        tamanho: tamanho || null,
        fornecedor: fornecedor || null,
        custo_unitario: custoUnitario,
        markup_x: markupX || null,
        margem_desejada_pct: margemPct || null,
        impostos_pct: impostosPct,
        taxa_cartao_pct: cartaoPct,
        marketing_pct: marketingPct,
        outras_deducoes_pct: outrasPct,
        embalagem_rs: embalagemRs,
        despesa_peca_rs: pecaRs,
        preco_sugerido: precoSugerido,
        preco_atual: precoFinal,
        foto_url: fotoUrl,
        ativo: true,
      })
      .select("id")
      .single();

    if (error || !inserted) throw new Error(error?.message ?? "Erro ao inserir produto");
    productId = inserted.id;
  }

  await supabaseAdmin.from("purchase_entries").insert({
    product_id: productId,
    data_compra: dataCcompra,
    quantidade,
    custo_unitario: custoUnitario,
    fornecedor: fornecedor || null,
  });

  revalidatePath("/compras");
}

export async function updateProductPrice(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const precoAtual = parseDecimal(formData.get("preco_atual"));
  if (!id) return;

  await supabaseAdmin
    .from("products")
    .update({ preco_atual: precoAtual, updated_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/compras");
}

export async function updateProduct(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const nome = String(formData.get("nome") ?? "").trim();
  const cor = String(formData.get("cor") ?? "").trim();
  const tamanho = String(formData.get("tamanho") ?? "").trim();

  function parseMoney2(value: FormDataEntryValue | null): number {
    if (!value) return 0;
    const cleaned = String(value).trim().replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  }

  const custoUnitario = parseMoney2(formData.get("custo_unitario"));
  const precoAtual = parseMoney2(formData.get("preco_atual"));

  const fotoFile = formData.get("foto");
  let fotoUrl: string | null = null;
  if (fotoFile instanceof File && fotoFile.size > 0) {
    const { data: prod } = await supabaseAdmin
      .from("products")
      .select("codigo")
      .eq("id", id)
      .single();
    if (prod?.codigo) {
      fotoUrl = await uploadFoto(fotoFile, prod.codigo);
    }
  }

  const payload: Record<string, unknown> = {
    nome: nome || undefined,
    cor: cor || null,
    tamanho: tamanho || null,
    custo_unitario: custoUnitario || undefined,
    preco_atual: precoAtual || undefined,
    updated_at: new Date().toISOString(),
  };
  if (fotoUrl) payload.foto_url = fotoUrl;

  await supabaseAdmin.from("products").update(payload).eq("id", id);

  revalidatePath("/compras");
  revalidatePath("/vendas");
}

export async function deleteProduct(id: string) {
  if (!id) return;
  await supabaseAdmin
    .from("products")
    .update({ ativo: false, updated_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/compras");
  revalidatePath("/vendas");
}
