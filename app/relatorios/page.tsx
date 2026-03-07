import { AppShell } from "@/components/app-shell";
import { Panel, StatCard } from "@/components/panel";

export default function RelatoriosPage() {
  return (
    <AppShell
      title="Relatórios operacionais"
      subtitle="Resultado em tempo real e quanto precisa vender no mês"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Faturamento no mês" value="R$ 0,00" />
        <StatCard label="Lucro líquido no mês" value="R$ 0,00" />
        <StatCard label="Ticket médio" value="R$ 0,00" />
        <StatCard label="Peças vendidas" value="0" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Panel
          title="Metas e ponto de equilíbrio"
          subtitle="Essa é a parte mais importante do ERP"
        >
          <div className="grid gap-3">
            <div className="rounded-2xl border border-[var(--line)] bg-black/10 p-4">
              <p className="text-sm text-[var(--muted)]">
                Faturamento mínimo para empatar
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">R$ 0,00</p>
            </div>

            <div className="rounded-2xl border border-[var(--line)] bg-black/10 p-4">
              <p className="text-sm text-[var(--muted)]">
                Faturamento mínimo para atingir objetivo
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">R$ 0,00</p>
            </div>

            <div className="rounded-2xl border border-[var(--line)] bg-black/10 p-4">
              <p className="text-sm text-[var(--muted)]">
                Quanto ainda falta vender este mês
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">R$ 0,00</p>
            </div>
          </div>
        </Panel>

        <Panel
          title="Blocos de análise"
          subtitle="Vamos preencher com dados reais na próxima etapa"
        >
          <div className="grid gap-3 md:grid-cols-2">
            {[
              "Vendas por período",
              "Produtos mais vendidos",
              "Produtos parados",
              "Margem real por produto",
              "Resultado operacional",
              "Meta x realizado",
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
    </AppShell>
  );
}
