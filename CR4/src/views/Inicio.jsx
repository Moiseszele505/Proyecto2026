import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Alert, Image } from "react-bootstrap";
import { Link } from "react-router-dom";
import { supabase } from "../database/supabaseconfig";
import "bootstrap-icons/font/bootstrap-icons.css";

const Inicio = () => {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        const { data: productosData } = await supabase
            .from("productos")
            .select("*")
            .order("id_producto", { ascending: false });

        const { data: categoriasData } = await supabase
            .from("categorias")
            .select("*");

        setProductos(productosData || []);
        setCategorias(categoriasData || []);
    };

    const stockTotal = productos.reduce(
        (total, p) => total + Number(p.stock_producto || 0),
        0
    );

    const valorInventario = productos.reduce(
        (total, p) =>
            total + Number(p.precio_producto || 0) * Number(p.stock_producto || 0),
        0
    );

    const productosBajoStock = productos.filter(
        (p) => Number(p.stock_producto) <= 5
    );

    const ultimosProductos = productos.slice(0, 4);

    return (
        <Container className="mt-4">

            <Row className="mb-4">
                <Col>
                    <h1 className="fw-bold">
                        <i className="bi bi-house-door-fill me-2"></i>
                        Inicio
                    </h1>
                </Col>
            </Row>

            <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="p-5 text-center">
                    <h2 className="fw-bold">Bienvenido a DiscoSA</h2>
                    <p className="text-muted fs-5">
                        Sistema de gestión para productos, categorías, precios y stock.
                    </p>

                    <div className="d-flex justify-content-center gap-3 mt-4">
                        <Button as={Link} to="/productos" variant="primary">
                            <i className="bi bi-bag-heart-fill me-2"></i>
                            Ver Productos
                        </Button>

                        <Button as={Link} to="/categorias" variant="outline-primary">
                            <i className="bi bi-tags-fill me-2"></i>
                            Ver Categorías
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            <Row className="mb-4">
                <Col xs={12} md={3} className="mb-3">
                    <Card className="border-0 shadow-sm text-center">
                        <Card.Body>
                            <i className="bi bi-box-seam fs-1 text-primary"></i>
                            <h3>{productos.length}</h3>
                            <p className="text-muted mb-0">Productos</p>
                        </Card.Body>
                    </Card>
                </Col>

                <Col xs={12} md={3} className="mb-3">
                    <Card className="border-0 shadow-sm text-center">
                        <Card.Body>
                            <i className="bi bi-tags fs-1 text-success"></i>
                            <h3>{categorias.length}</h3>
                            <p className="text-muted mb-0">Categorías</p>
                        </Card.Body>
                    </Card>
                </Col>

                <Col xs={12} md={3} className="mb-3">
                    <Card className="border-0 shadow-sm text-center">
                        <Card.Body>
                            <i className="bi bi-boxes fs-1 text-warning"></i>
                            <h3>{stockTotal}</h3>
                            <p className="text-muted mb-0">Stock total</p>
                        </Card.Body>
                    </Card>
                </Col>

                <Col xs={12} md={3} className="mb-3">
                    <Card className="border-0 shadow-sm text-center">
                        <Card.Body>
                            <i className="bi bi-cash-coin fs-1 text-danger"></i>
                            <h3>C$ {valorInventario.toFixed(2)}</h3>
                            <p className="text-muted mb-0">Valor inventario</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mb-4">
                <Col xs={12} md={6} className="mb-3">
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <h4 className="fw-bold mb-3">
                                <i className="bi bi-clock-history me-2"></i>
                                Últimos productos
                            </h4>

                            {ultimosProductos.length > 0 ? (
                                ultimosProductos.map((producto) => (
                                    <div
                                        key={producto.id_producto}
                                        className="d-flex align-items-center border-bottom py-2"
                                    >
                                        {producto.imagen_producto ? (
                                            <Image
                                                src={producto.imagen_producto}
                                                width="50"
                                                height="50"
                                                rounded
                                                className="me-3"
                                                style={{ objectFit: "cover" }}
                                            />
                                        ) : (
                                            <i className="bi bi-image fs-2 me-3 text-muted"></i>
                                        )}

                                        <div className="flex-grow-1">
                                            <div className="fw-semibold">
                                                {producto.nombre_producto}
                                            </div>
                                            <small className="text-muted">
                                                Stock: {producto.stock_producto}
                                            </small>
                                        </div>

                                        <strong>C$ {producto.precio_producto}</strong>
                                    </div>
                                ))
                            ) : (
                                <Alert variant="info">No hay productos registrados.</Alert>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col xs={12} md={6} className="mb-3">
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <h4 className="fw-bold mb-3">
                                <i className="bi bi-exclamation-triangle-fill me-2 text-warning"></i>
                                Productos con bajo stock
                            </h4>

                            {productosBajoStock.length > 0 ? (
                                productosBajoStock.map((producto) => (
                                    <Alert
                                        key={producto.id_producto}
                                        variant="warning"
                                        className="py-2 mb-2"
                                    >
                                        <strong>{producto.nombre_producto}</strong> — Stock:{" "}
                                        {producto.stock_producto}
                                    </Alert>
                                ))
                            ) : (
                                <Alert variant="success">
                                    Todos los productos tienen buen stock.
                                </Alert>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                    <h4 className="fw-bold mb-3">
                        <i className="bi bi-info-circle-fill me-2"></i>
                        Acerca de DiscoSA
                    </h4>
                    <p className="text-muted mb-0">
                        DiscoSA es un sistema diseñado para facilitar la administración
                        de productos, categorías e inventario, permitiendo llevar un mejor
                        control de precios, existencias e información general del negocio.
                    </p>
                </Card.Body>
            </Card>

        </Container>
    );
};

export default Inicio;