import { AppShell } from "@/components/app-shell";
import { Field, Panel, StatCard } from "@/components/panel";

export default function ConfiguracoesPage() {
  return (
    <AppShell
      title="Configurações gerais"
      subtitle="Custos fixos, regras padrão e metas operacionais"
    >
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <Panel
            title="Custos fixos mensais"
            subtitle="Aqui entram aluguel, energia, internet, pró-labore e outros"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Aluguel" placeholder="R$ 0,00" />
              <Field label="Água" placeholder="R$ 0,00" />
              <Field label="Energia" placeholder="R$ 0,00" />
              <Field label="Internet" placeholder="R$ 0,00" />
              <Field label="Pró-labore" placeholder="R$ 0,00" />
              <Field label="Salários" placeholder="R$ 0,00" />
              <Field label="Marketing mensal" placeholder="R$ 0,00" />
              <Field label="Outros fixos" placeholder="R$ 0,00" />
            </div>
          </Panel>

          <Panel
            title="Padrões de precificação"
            subtitle="Valores padrão usados ao cadastrar compras"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Markup padrão (x)" placeholder="3,0" />
              <Field label="Impostos padrão (%)" placeholder="6,0" />
              <Field label="Taxa cartão padrão (%)" placeholder="5,0" />
              <Field label="Comissão vendedor (%)" placeholder="2,0" />
              <Field label="Marketing (%)" placeholder="0,0" />
              <Field label="Outras deduções (%)" placeholder="0,0" />
              <Field label="Embalagem padrão (R$)" placeholder="1,40" />
              <Field label="Despesa por peça (R$)" placeholder="2,00" />
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel
            title="Objetivos"
            subtitle="Além de custo fixo, aqui entra o que a loja quer construir"
          >
            <div className="grid gap-4">
              <Field label="Meta de lucro líquido mensal" placeholder="R$ 0,00" />
              <Field label="Objetivo de dinheiro em caixa" placeholder="R$ 0,00" />
              <Field label="Objetivo para compras" placeholder="R$ 0,00" />
              <Field label="Ticket médio alvo" placeholder="R$ 0,00" />
              <Field label="Margem mínima desejada (%)" placeholder="0,0" />
            </div>
          </Panel>

          <Panel
            title="Indicadores calculados"
            subtitle="Vão puxar automaticamente do banco"
          >
            <div className="grid gap-3">
              <StatCard label="Total custos fixos" value="R$ 0,00" />
              <StatCard label="Meta operacional do mês" value="R$ 0,00" />
              <StatCard label="Faturamento necessário" value="R$ 0,00" />
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
