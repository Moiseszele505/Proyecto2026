import React from "react";
import { Table, Button, Image } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TablaProductos = ({ productos, abrirModalEdicion, abrirModalEliminacion, generarPDFProducto, }) => {
    return (
        <Table striped borderless hover responsive size="sm">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Imagen</th>
                    <th>Producto</th>
                    <th className="d-none d-md-table-cell">Descripción</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Fecha</th>
                    <th className="text-center">Acciones</th>
                </tr>
            </thead>

            <tbody>
                {productos.map((producto) => (
                    <tr key={producto.id_producto}>
                        <td>{producto.id_producto}</td>

                        <td>
                            {producto.imagen_producto ? (
                                <Image
                                    src={producto.imagen_producto}
                                    width="50"
                                    height="50"
                                    rounded
                                    style={{ objectFit: "cover" }}
                                />
                            ) : (
                                <i className="bi bi-image fs-3 text-muted"></i>
                            )}
                        </td>

                        <td>{producto.nombre_producto}</td>

                        <td className="d-none d-md-table-cell">
                            {producto.descripcion_producto}
                        </td>

                        <td>C$ {producto.precio_producto}</td>
                        <td>{producto.stock_producto}</td>
                        <td>
                            {producto.fecha_registro
                                ? new Date(producto.fecha_registro).toLocaleDateString()
                                : "Sin fecha"}
                        </td>
                        <td className="text-center">
                            <Button
                                variant="outline-warning"
                                size="sm"
                                className="m-1"
                                onClick={() => abrirModalEdicion(producto)}
                            >
                                <i className="bi bi-pencil"></i>
                            </Button>

                            <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => abrirModalEliminacion(producto)}
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
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
};

export default TablaProductos;