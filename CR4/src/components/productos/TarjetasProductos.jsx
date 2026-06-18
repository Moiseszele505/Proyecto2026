import React, { useState } from "react";
import { Card, Row, Col, Button, Image } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TarjetaProducto = ({ productos, abrirModalEdicion, abrirModalEliminacion, generarPDFProducto, copiarProducto,
    generarQRImagen, }) => {
    const [idTarjetaActiva, setIdTarjetaActiva] = useState(null);

    const alternarTarjeta = (id) => {
        setIdTarjetaActiva(idTarjetaActiva === id ? null : id);
    };

    return (
        <div>
            {productos.map((producto) => {
                const activa = idTarjetaActiva === producto.id_producto;

                return (
                    <Card
                        key={producto.id_producto}
                        className="mb-3 border-0 rounded-3 shadow-sm w-100"
                        onClick={() => alternarTarjeta(producto.id_producto)}
                    >
                        <Card.Body className="p-2">
                            <Row className="align-items-center">
                                <Col xs={3}>
                                    {producto.imagen_producto ? (
                                        <Image
                                            src={producto.imagen_producto}
                                            rounded
                                            fluid
                                            style={{
                                                height: "70px",
                                                width: "70px",
                                                objectFit: "cover"
                                            }}
                                        />
                                    ) : (
                                        <div className="bg-light rounded d-flex align-items-center justify-content-center"
                                            style={{ height: "70px", width: "70px" }}>
                                            <i className="bi bi-image fs-3 text-muted"></i>
                                        </div>
                                    )}
                                </Col>

                                <Col xs={6}>
                                    <div className="fw-semibold text-truncate">
                                        {producto.nombre_producto}
                                    </div>

                                    <div className="small text-muted text-truncate">
                                        {producto.descripcion_producto}
                                    </div>

                                    <div className="small">
                                        Stock: {producto.stock_producto}
                                    </div>
                                </Col>

                                <Col xs={3} className="text-end">
                                    <div className="fw-bold">
                                        C$ {producto.precio_producto}
                                    </div>
                                </Col>
                            </Row>

                            {activa && (
                                <div className="d-flex justify-content-end gap-2 mt-3">
                                    <Button
                                        variant="outline-warning"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            abrirModalEdicion(producto);
                                        }}
                                    >
                                        <i className="bi bi-pencil"></i>
                                    </Button>

                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            abrirModalEliminacion(producto);
                                        }}
                                    >
                                        <i className="bi bi-trash"></i>
                                    </Button>

                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        className="m-1"
                                        onClick={() => generarPDFProducto(producto)}
                                    >
                                        <i className="bi bi-file-earmark-pdf"></i>
                                    </Button>

                                    <Button
                                        variant="outline-success"
                                        size="sm"
                                        className="me-1"
                                        onClick={() => copiarProducto(producto)}
                                    >
                                        <i className="bi bi-clipboard"></i>
                                    </Button>

                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="me-1"
                                        onClick={() => generarQRImagen(producto)}
                                    >
                                        <i className="bi bi-qr-code"></i>
                                    </Button>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                );
            })}
        </div>
    );
};

export default TarjetaProducto;