import { AppShell } from "@/components/app-shell";
import { Panel, Pill, StatCard } from "@/components/panel";

export default function HomePage() {
  return (
    <AppShell
      title="Dashboard"
      subtitle="Visão geral do ERP da Brivia Modas"
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Vendas do mês"
          value="R$ 0,00"
          hint="Entrará em tempo real no passo 2"
        />
        <StatCard
          label="Lucro líquido"
          value="R$ 0,00"
          hint="Baseado em compras, vendas e metas"
        />
        <StatCard
          label="Estoque atual"
          value="0 peças"
          hint="Compra - venda"
        />
        <StatCard
          label="Faturamento mínimo"
          value="R$ 0,00"
          hint="Para empatar / bater objetivo"
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel
          title="Módulos desta V1"
          subtitle="Baseados na sua planilha atual"
        >
          <div className="flex flex-wrap gap-2">
            <Pill>Cadastro de compras</Pill>
            <Pill>Custos variáveis por produto</Pill>
            <Pill>Configurações gerais</Pill>
            <Pill>Custos fixos</Pill>
            <Pill>Objetivo de caixa</Pill>
            <Pill>Objetivo para compras</Pill>
            <Pill>Baixa de vendas</Pill>
            <Pill>Relatórios operacionais</Pill>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-[var(--line)] bg-black/10 p-4">
              <p className="text-sm font-medium text-white">Compras</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Data, código, peça, quantidade, cor, fornecedor, custo,
                markup/margem, taxa de cartão e preço sugerido.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--line)] bg-black/10 p-4">
              <p className="text-sm font-medium text-white">Vendas</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Busca rápida por código/nome, desconto, acréscimo, forma de
                pagamento e baixa automática no estoque.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--line)] bg-black/10 p-4">
              <p className="text-sm font-medium text-white">
                Configurações gerais
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Custos fixos mensais, metas, percentuais padrão e objetivos de
                caixa e de reposição de mercadoria.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--line)] bg-black/10 p-4">
              <p className="text-sm font-medium text-white">Relatórios</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Quanto vender por mês, ponto de equilíbrio, lucro real, ticket
                médio e desempenho operacional.
              </p>
            </div>
          </div>
        </Panel>

        <Panel
          title="Lógica central"
          subtitle="Como o sistema vai funcionar"
        >
          <div className="space-y-3">
            {[
              "Toda compra já entra com custo e variáveis para sugerir o preço de venda.",
              "A tela de configurações vira o cérebro do sistema.",
              "A venda baixa estoque em poucos cliques.",
              "O dashboard mostra quanto falta vender para empatar e para atingir a meta.",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-[var(--line)] bg-black/10 p-4 text-sm leading-6 text-[var(--muted)]"
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
