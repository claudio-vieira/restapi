
var express = require('express');
var app = express();
//var db_ = require('./queries_');
var db_st = require('./queries_st');
var db_comissao = require('./queries_comissao');
var db_notafiscal = require('./queries_notafiscal');
var db_notaitens = require('./queries_notaitens');
var db_historico_gordura = require('./queries_historico_gordura');
var db_promocao_especial = require('./queries_promocao_especial');
var db_titulos = require('./queries_titulos');
var db_tipo_tabela = require('./queries_tipo_tabela');
var db_supervisores = require('./queries_supervisores');
var db_supervisionados = require('./queries_supervisionados');
var db_saldo_gordura = require('./queries_saldo_gordura');
var db_lista_preco = require('./queries_lista_preco');
var db_forma_pagamento = require('./queries_forma_pagamento');
var db_vendas = require('./queries_vendas');
var db_produtos = require('./queries_produtos');
var db_volumes = require('./queries_volumes');
var db_sub_grupos = require('./queries_sub_grupos');
var db_grupos = require('./queries_grupos');
var db_grupo_recebe_desconto = require('./queries_grupo_recebe_desconto');
var db_grupo_concede_desconto = require('./queries_grupo_concede_desconto');
var db_filial = require('./queries_filial_representante');
var db_local_faturamento = require('./queries_local_faturamento');
var db_itens_pedido = require('./queries_itens_pedido');
var db_pedidos = require('./queries_pedidos');
var db_vendedores = require('./queries_vendedores');
var db_clientes = require('./queries_clientes');
var db_detalhe_gordura = require('./queries_detalhe_gordura');
var db_processos = require('./processos');
var db_envioEmail = require('./envioEmail');
var bodyParser = require('body-parser');

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json({limit: '10mb', extended: true})) // support json encoded bodies
app.use(bodyParser.urlencoded({limit: '10mb', extended: true})) // support encoded bodies

app.listen(3001, function () {
  console.log('Example app listening on port 3001!');
});

//Chamadas da Promocao Especial
app.post('/api/recuperarHistoricoGordura', db_historico_gordura.recuperarHistoricoGordura);
app.post('/api/recuperarHistoricoGorduraPorCodigo', db_historico_gordura.recuperarHistoricoGorduraPorCodigo);
app.post('/api/inserirHistoricoGordura', db_historico_gordura.inserirHistoricoGordura);
app.post('/api/deletarHistoricoGorduraPorCodigo', db_historico_gordura.deletarHistoricoGorduraPorCodigo);
app.post('/api/deletarHistoricoGordura', db_historico_gordura.deletarHistoricoGordura);


//Chamadas da Promocao Especial
app.post('/api/recuperarPromocaoEspecial', db_promocao_especial.recuperarPromocaoEspecial);
app.post('/api/recuperarPromocaoEspecialPorCodigo', db_promocao_especial.recuperarPromocaoEspecialPorCodigo);
app.post('/api/recuperarPromocaoEspecialPorVendedor', db_promocao_especial.recuperarPromocaoEspecialPorVendedor);
app.post('/api/inserirPromocaoEspecial', db_promocao_especial.inserirPromocaoEspecial);
app.post('/api/deletarPromocaoEspecialPorCodigo', db_promocao_especial.deletarPromocaoEspecialPorCodigo);
app.post('/api/deletarPromocaoEspecial', db_promocao_especial.deletarPromocaoEspecial);


//Chamadas dos NotaFiscal
app.post('/api/recuperarNotaFiscal', db_notafiscal.recuperarNotaFiscal);
app.post('/api/recuperarNotaFiscalPorCodigo', db_notafiscal.recuperarNotaFiscalPorCodigo);
app.post('/api/recuperarNotaFiscalPorVendedor', db_notafiscal.recuperarNotaFiscalPorVendedor);
app.post('/api/inserirNotas', db_notafiscal.inserirNotas);
app.post('/api/deletarNotaFiscalPorCodigo', db_notafiscal.deletarNotaFiscalPorCodigo);
app.post('/api/deletarNotas', db_notafiscal.deletarNotas);

//Chamadas dos NotaItens
app.post('/api/recuperarNotaItens', db_notaitens.recuperarNotaItens);
app.post('/api/recuperarNotaItensPorNota', db_notaitens.recuperarNotaItensPorNota);
app.post('/api/recuperarNotaItensPorVendedor', db_notaitens.recuperarNotaItensPorVendedor);
app.post('/api/inserirNotasItens', db_notaitens.inserirNotasItens);
app.post('/api/deletarNotaItensPorCodigo', db_notaitens.deletarNotaItensPorCodigo);
app.post('/api/deletarNotasItens', db_notaitens.deletarNotasItens);


//Chamadas dos Titulos
app.post('/api/recuperarTitulos', db_titulos.recuperarTitulos);
app.post('/api/recuperarTituloPorCodigo', db_titulos.recuperarTituloPorCodigo);
app.post('/api/recuperarTituloPorVendedor', db_titulos.recuperarTituloPorVendedor);
app.post('/api/inserirTitulos', db_titulos.inserirTitulos);
app.post('/api/deletarTituloPorCodigo', db_titulos.deletarTituloPorCodigo);
app.post('/api/deletarTitulos', db_titulos.deletarTitulos);

//Chamadas dos Comissao
app.post('/api/recuperarComissao', db_comissao.recuperarComissao);
app.post('/api/inserirComissao', db_comissao.inserirComissao);
app.post('/api/deletarComissao', db_comissao.deletarComissao);
app.post('/api/recuperarComissaoPorVendedor', db_comissao.recuperarComissaoPorVendedor);

//Chamadas dos SubstituicaoTributaria
app.post('/api/recuperarST', db_st.recuperarST);
app.post('/api/inserirSt', db_st.inserirSt);
app.post('/api/deletarSt', db_st.deletarSt);
app.post('/api/recuperarStPorVendedor', db_st.recuperarStPorVendedor);


//Chamadas do Tipo Tabela
app.post('/api/recuperarTipoTabela', db_tipo_tabela.recuperarTipoTabela);
app.post('/api/recuperarTipoTabelaPorVendedor', db_tipo_tabela.recuperarTipoTabelaPorVendedor);
app.post('/api/recuperarTipoTabelaPorCodigoEVendedor', db_tipo_tabela.recuperarTipoTabelaPorCodigoEVendedor);
app.post('/api/inserirTipoTabela', db_tipo_tabela.inserirTipoTabela);
app.post('/api/deletarTipoTabelaPorCodigo', db_tipo_tabela.deletarTipoTabelaPorCodigo);
app.post('/api/deletarTipoTabela', db_tipo_tabela.deletarTipoTabela);



//Chamadas dos Supervisores
app.post('/api/recuperarSupervisores', db_supervisores.recuperarSupervisores);
app.post('/api/recuperarSupervisorPorCodigo', db_supervisores.recuperarSupervisorPorCodigo);
app.post('/api/recuperarSupervisorPorCodigoGorduraAnoMes', db_supervisores.recuperarSupervisorPorCodigoGorduraAnoMes);
app.post('/api/recuperarSupervisorParaLogin', db_supervisores.recuperarSupervisorParaLogin);
app.post('/api/inserirSupervisores', db_supervisores.inserirSupervisores);
app.post('/api/deletarSupervisorPorCodigo', db_supervisores.deletarSupervisorPorCodigo);
app.post('/api/deletarSupervisores', db_supervisores.deletarSupervisores);



//Chamadas dos Supervisionados
app.post('/api/recuperarSupervisionados', db_supervisionados.recuperarSupervisionados);
app.post('/api/recuperarSupervisionadoPorCodigoEVendedor', db_supervisionados.recuperarSupervisionadoPorCodigoEVendedor);
app.post('/api/recuperarSupervisionadoPorVendedor', db_supervisionados.recuperarSupervisionadoPorVendedor);
app.post('/api/inserirSupervisionados', db_supervisionados.inserirSupervisionados);
app.post('/api/deletarSupervisionadoPorCodigo', db_supervisionados.deletarSupervisionadoPorCodigo);
app.post('/api/deletarSupervisionados', db_supervisionados.deletarSupervisionados);



//Chamadas do Saldo Gordura
app.post('/api/recuperarSaldoGordura', db_saldo_gordura.recuperarSaldoGordura);
app.post('/api/recuperarSaldoGorduraPorVendedor', db_saldo_gordura.recuperarSaldoGorduraPorVendedor);
app.post('/api/recuperarSaldoGorduraPorCodigoEVendedor', db_saldo_gordura.recuperarSaldoGorduraPorCodigoEVendedor);
app.post('/api/inserirSaldoGordura', db_saldo_gordura.inserirSaldoGordura);
app.post('/api/deletarSaldoGorduraPorCodigo', db_saldo_gordura.deletarSaldoGorduraPorCodigo);
app.post('/api/deletarSaldoGordura', db_saldo_gordura.deletarSaldoGordura);
app.post('/api/atualizarSaldoGordura', db_saldo_gordura.atualizarSaldoGordura);



//Chamadas da Lista Preco
app.post('/api/recuperarListaPreco', db_lista_preco.recuperarListaPreco);
app.post('/api/recuperarListaPrecoPorCodigo', db_lista_preco.recuperarListaPrecoPorCodigo);
app.post('/api/recuperarListaPrecoPorVendedor', db_lista_preco.recuperarListaPrecoPorVendedor);
app.post('/api/inserirListaPreco', db_lista_preco.inserirListaPreco);
app.post('/api/deletarListaPrecoPorCodigo', db_lista_preco.deletarListaPrecoPorCodigo);
app.post('/api/deletarListaPreco', db_lista_preco.deletarListaPreco);


//Chamadas das Formas Pagamento
app.post('/api/recuperarFormasPagamento', db_forma_pagamento.recuperarFormasPagamento);
app.post('/api/recuperarFormaPagamentoPorCodigo', db_forma_pagamento.recuperarFormaPagamentoPorCodigo);
app.post('/api/inserirFormasPagamento', db_forma_pagamento.inserirFormasPagamento);
app.post('/api/deletarFormaPagamentoPorCodigo', db_forma_pagamento.deletarFormaPagamentoPorCodigo);
app.post('/api/deletarFormasPagamento', db_forma_pagamento.deletarFormasPagamento);


//Chamadas das vendas
app.post('/api/recuperarVendas', db_vendas.recuperarVendas);
app.post('/api/recuperarVendaPorCodigo', db_vendas.recuperarVendaPorCodigo);
app.post('/api/inserirVendas', db_vendas.inserirVendas);
app.post('/api/deletarVendaPorCodigo', db_vendas.deletarVendaPorCodigo);
app.post('/api/deletarVendas', db_vendas.deletarVendas);


//Chamadas dos produtos
app.post('/api/recuperarProdutos', db_produtos.recuperarProdutos);
app.post('/api/recuperarProdutoPorCodigo', db_produtos.recuperarProdutoPorCodigo);
app.post('/api/inserirProdutos', db_produtos.inserirProdutos);
app.post('/api/deletarProdutoPorCodigo', db_produtos.deletarProdutoPorCodigo);
app.post('/api/deletarProdutos', db_produtos.deletarProdutos);


//Chamadas dos Volumes
app.post('/api/recuperarVolumes', db_volumes.recuperarVolumes);
app.post('/api/recuperarVolumePorVendedor', db_volumes.recuperarVolumePorVendedor);
app.post('/api/recuperarVolumePorCodigoEVendedor', db_volumes.recuperarVolumePorCodigoEVendedor);
app.post('/api/inserirVolumes', db_volumes.inserirVolumes);
app.post('/api/deletarVolumePorCodigo', db_volumes.deletarVolumePorCodigo);
app.post('/api/deletarVolumes', db_volumes.deletarVolumes);


//Chamadas dos Subrupos
app.post('/api/recuperarSubgrupo', db_sub_grupos.recuperarSubgrupo);
app.post('/api/recuperarSubgrupoPorCodigo', db_sub_grupos.recuperarSubgrupoPorCodigo);
app.post('/api/inserirSubgrupo', db_sub_grupos.inserirSubgrupo);
app.post('/api/deletarSubgrupoPorCodigo', db_sub_grupos.deletarSubgrupoPorCodigo);
app.post('/api/deletarSubgrupo', db_sub_grupos.deletarSubgrupo);


//Chamadas dos Grupos
app.post('/api/recuperarGrupos', db_grupos.recuperarGrupos);
app.post('/api/recuperarGruposPorCodigo', db_grupos.recuperarGruposPorCodigo);
app.post('/api/inserirGrupos', db_grupos.inserirGrupos);
app.post('/api/deletarGruposPorCodigo', db_grupos.deletarGruposPorCodigo);
app.post('/api/deletarGrupos', db_grupos.deletarGrupos);


//Chamadas do Grupo Concede Desconto
app.post('/api/recuperarGrupoRecebeDesconto', db_grupo_recebe_desconto.recuperarGrupoRecebeDesconto);
app.post('/api/recuperarGrupoRecebeDescontoPorCodigo', db_grupo_recebe_desconto.recuperarGrupoRecebeDescontoPorCodigo);
app.post('/api/inserirGrupoRecebeDesconto', db_grupo_recebe_desconto.inserirGrupoRecebeDesconto);
app.post('/api/deletarGrupoRecebeDescontoPorCodigo', db_grupo_recebe_desconto.deletarGrupoRecebeDescontoPorCodigo);
app.post('/api/deletarGrupoRecebeDesconto', db_grupo_recebe_desconto.deletarGrupoRecebeDesconto);


//Chamadas do Grupo Concede Desconto
app.post('/api/recuperarGrupoConcedeDesconto', db_grupo_concede_desconto.recuperarGrupoConcedeDesconto);
app.post('/api/recuperarGrupoConcedeDescontoPorCodigo', db_grupo_concede_desconto.recuperarGrupoConcedeDescontoPorCodigo);
app.post('/api/inserirGrupoConcedeDesconto', db_grupo_concede_desconto.inserirGrupoConcedeDesconto);
app.post('/api/deletarGrupoConcedeDescontoPorCodigo', db_grupo_concede_desconto.deletarGrupoConcedeDescontoPorCodigo);
app.post('/api/deletarGrupoConcedeDesconto', db_grupo_concede_desconto.deletarGrupoConcedeDesconto);


//Chamadas da filial representante
app.post('/api/recuperarFilial', db_filial.recuperarFilial);
app.post('/api/recuperarFilialPorVendedor', db_filial.recuperarFilialPorVendedor);
app.post('/api/recuperarFilialPorCodigoEVendedor', db_filial.recuperarFilialPorCodigoEVendedor);
app.post('/api/inserirFilial', db_filial.inserirFilial);
app.post('/api/deletarFilialPorCodigo', db_filial.deletarFilialPorCodigo);
app.post('/api/deletarFilial', db_filial.deletarFilial);
 

//Chamadas do local faturamento
app.post('/api/recuperarLocalFaturamento', db_local_faturamento.recuperarLocalFaturamento);
app.post('/api/recuperarLocalFaturamentoPorCodigo', db_local_faturamento.recuperarLocalFaturamentoPorCodigo);
app.post('/api/inserirLocalFaturamento', db_local_faturamento.inserirLocalFaturamento);
app.post('/api/deletarlocalfaturamentoPorCodigo', db_local_faturamento.deletarLocalFaturamentoPorCodigo);
app.post('/api/deletarlocalfaturamento', db_local_faturamento.deletarLocalFaturamento);


//Chamadas dos itens pedido
app.post('/api/recuperarItensPedido', db_itens_pedido.recuperarItensPedido);
app.post('/api/recuperarItensPedidoPorCodigo', db_itens_pedido.recuperarItensPedidoPorCodigo);
app.post('/api/recuperarItensPedidoPorVendedor', db_itens_pedido.recuperarItensPedidoPorVendedor);
app.post('/api/recuperarPorVendedorPedidoProduto', db_itens_pedido.recuperarPorVendedorPedidoProduto);
app.post('/api/recuperarItensPorPedido', db_itens_pedido.recuperarItensPorPedido);
app.post('/api/recuperarItensPorIdsPedidos', db_itens_pedido.recuperarItensPorIdsPedidos);
app.post('/api/recuperarItensIdsPedidoPorCodigo', db_itens_pedido.recuperarItensIdsPedidoPorCodigo);
app.post('/api/inserirItensPedido', db_itens_pedido.inserirItensPedido);
app.post('/api/deletarItensPedidoPorCodigo', db_itens_pedido.deletarItensPedidoPorCodigo);
app.post('/api/deletarItensPedido', db_itens_pedido.deletarItensPedido);


//Chamadas dos pedidos
app.post('/api/recuperarPedidos', db_pedidos.recuperarPedidos);
app.post('/api/recuperarPedidosPorVendedor', db_pedidos.recuperarPedidosPorVendedor);
app.post('/api/recuperarPedidosPorCodigoEVendedor', db_pedidos.recuperarPedidosPorCodigoEVendedor);
app.post('/api/recuperarPedidosPendentesSupervisor', db_pedidos.recuperarPedidosPendentesSupervisor);
app.post('/api/recuperarUltimoPedidoPorCodigoCliente', db_pedidos.recuperarUltimoPedidoPorCodigoCliente);
app.post('/api/recuperarUltimoPedidoPorCodigoClienteHistorico', db_pedidos.recuperarUltimoPedidoPorCodigoClienteHistorico);
app.post('/api/recuperarPedidosPorCliente', db_pedidos.recuperarPedidosPorCliente);
app.post('/api/recuperarPedidosPorFiltros', db_pedidos.recuperarPedidosPorFiltros);
app.post('/api/inserirPedidos', db_pedidos.inserirPedidos);
app.post('/api/deletarPedidoPorCodigo', db_pedidos.deletarPedidoPorCodigo);
app.post('/api/deletarPedidos', db_pedidos.deletarPedidos);


//Chamadas para vendedores
app.post('/api/recuperarVendedores', db_vendedores.recuperarVendedores);
app.post('/api/recuperarVendedoresPorCodigo/', db_vendedores.recuperarVendedorPorCodigo);
app.post('/api/recuperarVendedorPorNome/', db_vendedores.recuperarVendedorPorNome);
app.post('/api/recuperarVendedorPorNomeCodigo/', db_vendedores.recuperarVendedorPorNomeCodigo);
app.post('/api/recuperarVendedorPorCdSupervisor/', db_vendedores.recuperarVendedorPorCdSupervisor);
app.post('/api/atualizarVendedor/', db_vendedores.atualizarVendedor);
app.post('/api/inserirVendedores/', db_vendedores.inserirVendedores);
app.post('/api/deletarVendedores/', db_vendedores.deletarVendedores);
app.post('/api/deletarVendedorPorCodigo/', db_vendedores.deletarVendedorPorCodigo);


//Chamadas dos clientes
app.post('/api/recuperarClientes', db_clientes.recuperarClientes);
app.post('/api/recuperarClientePorVendedor/', db_clientes.recuperarClientePorVendedor);
app.post('/api/recuperarClientePorCodigoEVendedor/', db_clientes.recuperarClientePorCodigoEVendedor);
app.post('/api/recuperarClientePorCnpjEVendedor/', db_clientes.recuperarClientePorCnpjEVendedor);
app.post('/api/recuperarCidadesPorPedidosPorCliente/', db_clientes.recuperarCidadesPorPedidosPorCliente);
app.post('/api/deletarClientes/', db_clientes.deletarClientes);
app.post('/api/deletarClientePorCodigo/', db_clientes.deletarClientePorCodigo);
app.post('/api/inserirClientes/', db_clientes.inserirClientes);

//Chamadas dos detalhes da gordura
app.post('/api/recuperarDetalheGordura', db_detalhe_gordura.recuperarDetalheGordura);
app.post('/api/recuperarDetalheGorduraPorVendedor/', db_detalhe_gordura.recuperarDetalheGorduraPorVendedor);
app.post('/api/inserirDetalheGordura/', db_detalhe_gordura.inserirDetalheGordura);
app.post('/api/deletarTodosDetalheGordura/', db_detalhe_gordura.deletarTodosDetalheGordura);

app.post('/api/processarPedidos', db_processos.processarPedidos);
app.post('/api/rejeitarPedidoPendente', db_processos.rejeitarPedidoPendente);
app.post('/api/liberarPedidoPendente', db_processos.liberarPedidoPendente);

module.exports = app;
