import { AppShell } from "@/components/app-shell";
import { Field, Panel, SelectField, StatCard } from "@/components/panel";

export default function VendasPage() {
  return (
    <AppShell
      title="Vendas e baixa"
      subtitle="Venda simples, rápida e com atualização automática do estoque"
    >
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <Panel
            title="Buscar produto"
            subtitle="No passo 2 isso vai pesquisar por código, nome e cor"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Código ou nome" placeholder="Digite para buscar..." />
              <SelectField
                label="Forma de pagamento"
                options={["Pix", "Dinheiro", "Débito", "Crédito"]}
              />
              <Field label="Cliente" placeholder="Opcional" />
              <Field label="Quantidade" type="number" placeholder="1" />
              <Field label="Desconto (%)" placeholder="0,0" />
              <Field label="Desconto (R$)" placeholder="0,00" />
              <Field label="Acréscimo (%)" placeholder="0,0" />
              <Field label="Acréscimo (R$)" placeholder="0,00" />
            </div>

            <div className="mt-5 rounded-2xl border border-[var(--line)] bg-black/10 p-4">
              <p className="text-sm font-medium text-white">Produto selecionado</p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Aqui vamos mostrar peça, cor, preço atual, custo e margem real
                antes de finalizar a venda.
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button className="rounded-2xl bg-[var(--gold)] px-5 py-3 text-sm font-semibold text-[#2d2826] transition hover:opacity-90">
                Finalizar venda
              </button>
              <button className="rounded-2xl border border-[var(--line)] bg-white/5 px-5 py-3 text-sm text-[var(--gold-soft)] transition hover:bg-white/10">
                Cancelar
              </button>
            </div>
          </Panel>

          <Panel
            title="Fluxo desta tela"
            subtitle="Objetivo: dar baixa em pouquíssimos cliques"
          >
            <div className="grid gap-3 md:grid-cols-2">
              {[
                "Buscar produto",
                "Selecionar quantidade",
                "Aplicar desconto ou acréscimo",
                "Escolher forma de pagamento",
                "Finalizar",
                "Baixar estoque automaticamente",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-[var(--line)] bg-black/10 p-4 text-sm text-[var(--muted)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Resumo da venda" subtitle="Prévia em tempo real">
            <div className="grid gap-3">
              <StatCard label="Subtotal" value="R$ 0,00" />
              <StatCard label="Total final" value="R$ 0,00" />
              <StatCard label="Custo da venda" value="R$ 0,00" />
              <StatCard label="Lucro líquido" value="R$ 0,00" />
            </div>
          </Panel>

          <Panel
            title="Regras"
            subtitle="Essas travas entram no próximo passo"
          >
            <div className="space-y-3 text-sm leading-6 text-[var(--muted)]">
              <p className="rounded-2xl border border-[var(--line)] bg-black/10 p-4">
                Avisar quando a venda ficar abaixo do preço sugerido.
              </p>
              <p className="rounded-2xl border border-[var(--line)] bg-black/10 p-4">
                Permitir desconto, mas mostrar margem real.
              </p>
              <p className="rounded-2xl border border-[var(--line)] bg-black/10 p-4">
                Atualizar estoque imediatamente após concluir.
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
