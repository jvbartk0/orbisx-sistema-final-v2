from flask import Blueprint, request, jsonify
from datetime import datetime
from src.models.user import db
from src.models.orcamento import Orcamento, ServicoOrcamento

orcamentos_bp = Blueprint("orcamentos", __name__)

@orcamentos_bp.route("/orcamentos", methods=["GET"])
def listar_orcamentos():
    try:
        # Filtros opcionais
        status = request.args.get("status")
        cliente = request.args.get("cliente")
        texto = request.args.get("texto")
        
        query = Orcamento.query
        
        # Aplicar filtros
        if status:
            query = query.filter(Orcamento.status == status)
        
        if cliente:
            query = query.filter(Orcamento.cliente.ilike(f"%{cliente}%"))
        
        if texto:
            query = query.filter(
                db.or_(
                    Orcamento.titulo.ilike(f"%{texto}%"),
                    Orcamento.cliente.ilike(f"%{texto}%"),
                    Orcamento.descricao.ilike(f"%{texto}%")
                )
            )
        
        orcamentos = query.order_by(Orcamento.data_criacao.desc()).all()
        
        return jsonify({
            "orcamentos": [orcamento.to_dict() for orcamento in orcamentos]
        }), 200
        
    except Exception as e:
        return jsonify({"error": "Erro interno do servidor"}), 500

@orcamentos_bp.route("/orcamentos", methods=["POST"])
def criar_orcamento():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400
        
        # Validações obrigatórias
        titulo = data.get("titulo", "").strip()
        cliente = data.get("cliente", "").strip()
        descricao = data.get("descricao", "").strip()
        forma_pagamento = data.get("forma_pagamento", "").strip()
        prazo_entrega = data.get("prazo_entrega", "").strip()
        servicos = data.get("servicos", [])
        
        if not titulo:
            return jsonify({"error": "Título é obrigatório"}), 400
        
        if not cliente:
            return jsonify({"error": "Cliente é obrigatório"}), 400
        
        if not servicos or len(servicos) == 0:
            return jsonify({"error": "Pelo menos um serviço é obrigatório"}), 400
        
        # Converter data se fornecida
        prazo_obj = None
        if prazo_entrega:
            try:
                prazo_obj = datetime.strptime(prazo_entrega, "%Y-%m-%d").date()
            except ValueError:
                return jsonify({"error": "Formato de data inválido para prazo de entrega"}), 400
        
        # Criar novo orçamento
        novo_orcamento = Orcamento(
            titulo=titulo,
            cliente=cliente,
            descricao=descricao,
            forma_pagamento=forma_pagamento,
            prazo_entrega=prazo_obj
        )
        
        db.session.add(novo_orcamento)
        db.session.flush()  # Para obter o ID
        
        # Adicionar serviços
        for servico_data in servicos:
            nome = servico_data.get("nome", "").strip()
            quantidade = servico_data.get("quantidade", 1)
            preco_unitario = servico_data.get("preco_unitario", 0)
            
            if not nome:
                return jsonify({"error": "Nome do serviço é obrigatório"}), 400
            
            if quantidade <= 0:
                return jsonify({"error": "Quantidade deve ser maior que zero"}), 400
            
            if preco_unitario <= 0:
                return jsonify({"error": "Preço unitário deve ser maior que zero"}), 400
            
            novo_servico = ServicoOrcamento(
                orcamento_id=novo_orcamento.id,
                nome=nome,
                quantidade=int(quantidade),
                preco_unitario=float(preco_unitario)
            )
            
            db.session.add(novo_servico)
        
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Orçamento criado com sucesso",
            "orcamento": novo_orcamento.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Erro interno do servidor"}), 500

@orcamentos_bp.route("/orcamentos/<int:orcamento_id>/status", methods=["PUT"])
def atualizar_status(orcamento_id):
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "Dados não fornecidos"}), 400
        
        novo_status = data.get("status", "").strip()
        
        if novo_status not in ["pendente", "enviado", "aceito", "rejeitado"]:
            return jsonify({"error": "Status inválido"}), 400
        
        orcamento = Orcamento.query.get(orcamento_id)
        
        if not orcamento:
            return jsonify({"error": "Orçamento não encontrado"}), 404
        
        orcamento.status = novo_status
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Status atualizado com sucesso",
            "orcamento": orcamento.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Erro interno do servidor"}), 500

@orcamentos_bp.route("/orcamentos/<int:orcamento_id>", methods=["GET"])
def obter_orcamento(orcamento_id):
    try:
        orcamento = Orcamento.query.get(orcamento_id)
        
        if not orcamento:
            return jsonify({"error": "Orçamento não encontrado"}), 404
        
        return jsonify({
            "orcamento": orcamento.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({"error": "Erro interno do servidor"}), 500

@orcamentos_bp.route("/orcamentos/clientes", methods=["GET"])
def listar_clientes():
    try:
        # Buscar clientes únicos
        clientes = db.session.query(Orcamento.cliente).distinct().all()
        clientes_list = [cliente[0] for cliente in clientes if cliente[0]]
        
        return jsonify({
            "clientes": sorted(clientes_list)
        }), 200
        
    except Exception as e:
        return jsonify({"error": "Erro interno do servidor"}), 500

