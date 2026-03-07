import { AppShell } from "@/components/app-shell";
import { Field, Panel, SelectField, StatCard } from "@/components/panel";

export default function ComprasPage() {
  return (
    <AppShell
      title="Compras e cadastro de produtos"
      subtitle="Entrada de peças com precificação já embutida"
    >
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel
          title="Cadastro de compra"
          subtitle="Estrutura do formulário que vamos ligar ao banco no próximo passo"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Data" placeholder="dd/mm/aaaa" />
            <Field label="Código" placeholder="7890000000001" />
            <Field label="Peça" placeholder="Vestido, conjunto, blusa..." />
            <Field label="Quantidade" type="number" placeholder="0" />
            <Field label="Cor" placeholder="Preto" />
            <Field label="Fornecedor" placeholder="Nome do fornecedor" />
            <Field label="Custo unitário" placeholder="R$ 0,00" />
            <Field label="Markup desejado (x)" placeholder="3,0" />
            <Field label="Impostos (%)" placeholder="6,0" />
            <Field label="Taxa cartão (%)" placeholder="5,0" />
            <Field label="Comissão vendedor (%)" placeholder="2,0" />
            <Field label="Embalagem (R$)" placeholder="1,40" />
            <Field label="Marketing (%)" placeholder="0,0" />
            <Field label="Outras deduções (%)" placeholder="0,0" />
            <Field label="Frete subsidiado (R$)" placeholder="0,00" />
            <Field label="Despesa da peça (R$)" placeholder="2,00" />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button className="rounded-2xl bg-[var(--gold)] px-5 py-3 text-sm font-semibold text-[#2d2826] transition hover:opacity-90">
              Salvar compra
            </button>
            <button className="rounded-2xl border border-[var(--line)] bg-white/5 px-5 py-3 text-sm text-[var(--gold-soft)] transition hover:bg-white/10">
              Limpar
            </button>
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel
            title="Resumo automático"
            subtitle="Vai calcular em tempo real assim que ligarmos no Supabase"
          >
            <div className="grid gap-3">
              <StatCard label="Preço sugerido" value="R$ 0,00" />
              <StatCard label="Lucro bruto unitário" value="R$ 0,00" />
              <StatCard label="Lucro líquido unitário" value="R$ 0,00" />
              <StatCard label="Margem líquida" value="0,0%" />
            </div>
          </Panel>

          <Panel
            title="Autofill que vamos ativar"
            subtitle="Para deixar a digitação rápida"
          >
            <div className="grid gap-4">
              <SelectField
                label="Fornecedor recorrente"
                options={["Selecionar...", "Zonko Modas", "Fornecedor exemplo"]}
              />
              <SelectField
                label="Cor recorrente"
                options={["Selecionar...", "Preto", "Bege", "Verde"]}
              />
              <SelectField
                label="Categoria"
                options={["Selecionar...", "Vestidos", "Conjuntos", "Blusas"]}
              />
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
