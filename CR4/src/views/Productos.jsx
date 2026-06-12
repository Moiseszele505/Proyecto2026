import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Alert, Spinner } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";
import ModalRegistroProducto from "../components/productos/ModalRegistroProducto";
import NotificacionOperacion from "../components/NotificacionOperacion";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import ModalEdicionProducto from "../components/productos/ModalEdicionProducto";
import ModalEliminacionProducto from "../components/productos/ModalEliminacionProducto";
import TablaProductos from "../components/productos/TablaProducto";
import TarjetaProductos from "../components/productos/TarjetasProductos";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Productos = () => {
    const [productos, setProductos] = useState([]);
    const [productosFiltrados, setProductosFiltrados] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [nuevoProducto, setNuevoProducto] = useState({
        nombre_producto: "",
        descripcion_producto: "",
        id_categoria: "",
        precio_producto: "",
        stock_producto: "",
        imagen_producto: "",
        archivo: null,
    });

    const [productoAEliminar, setProductoAEliminar] = useState(null);
    const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });
    const [textoBusqueda, setTextoBusqueda] = useState("");
    const [mostrarModal, setMostrarModal] = useState(false);
    const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
    const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
    const [productoEditar, setProductoEditar] = useState(null);
    const [archivoActualizar, setArchivoActualizar] = useState(null);


    // Manejo de inputs
    const manejoCambioInput = (e) => {
        const { name, value } = e.target;
        setNuevoProducto((prev) => ({ ...prev, [name]: value }));
    };

    const manejoCambioArchivo = (e) => {
        const archivo = e.target.files[0];
        if (archivo && archivo.type.startsWith("image/")) {
            setNuevoProducto((prev) => ({ ...prev, archivo }));
        } else {
            alert("Selecciona una imagen válida (JPG, PNG, etc.)");
        }
    };

    const manejarBusqueda = (e) => {
        setTextoBusqueda(e.target.value);
    };

    // Filtrado de productos
    useEffect(() => {
        if (!textoBusqueda.trim()) {
            setProductosFiltrados(productos);
        } else {
            const textoLower = textoBusqueda.toLowerCase().trim();
            const filtrados = productos.filter((prod) => {
                const nombre = prod.nombre_producto?.toLowerCase() || "";
                const descripcion = prod.descripcion_producto?.toLowerCase() || "";
                const precio = prod.precio_producto?.toString() || "";
                return (
                    nombre.includes(textoLower) ||
                    descripcion.includes(textoLower) ||
                    precio.includes(textoLower)
                );
            });
            setProductosFiltrados(filtrados);
        }
    }, [textoBusqueda, productos]);

    useEffect(() => {
        cargarCategorias();
    }, []);

    // Cargar categorías
    const cargarCategorias = async () => {
        try {
            const { data, error } = await supabase
                .from("categorias")
                .select("*")
                .order("id_categorias", { ascending: true });
            if (error) throw error;
            setCategorias(data || []);
        } catch (err) {
            console.error("Error al cargar categorías:", err);
        }
    };

    // Agregar producto con imagen
    const agregarProducto = async () => {
        try {
            if (
                !nuevoProducto.nombre_producto.trim() ||
                !nuevoProducto.id_categoria ||
                !nuevoProducto.precio_producto ||
                !nuevoProducto.archivo
            ) {
                setToast({
                    mostrar: true,
                    mensaje: "Completa los campos obligatorios (nombre, categoría, precio e imagen)",
                    tipo: "advertencia",
                });
                return;
            }

            setMostrarModal(false);

            const nombreArchivo = `${Date.now()}_${nuevoProducto.archivo.name}`;
            const { error: uploadError } = await supabase.storage
                .from("imagenes_productos")
                .upload(nombreArchivo, nuevoProducto.archivo);

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
                .from("imagenes_productos")
                .getPublicUrl(nombreArchivo);
            const urlPublica = urlData.publicUrl;

            const { error } = await supabase.from("productos").insert([
                {
                    nombre_producto: nuevoProducto.nombre_producto,
                    descripcion_producto: nuevoProducto.descripcion_producto || null,
                    id_categoria: parseInt(nuevoProducto.id_categoria),
                    precio_producto: parseFloat(nuevoProducto.precio_producto),
                    stock_producto: parseInt(nuevoProducto.stock_producto),
                    imagen_producto: urlPublica,
                }
            ]);

            if (error) throw error;

            setNuevoProducto({
                nombre_producto: "",
                descripcion_producto: "",
                id_categoria: "",
                precio_producto: "",
                stock_producto: "",
                imagen_producto: "",
                archivo: null,
            });

            setToast({ mostrar: true, mensaje: "Producto registrado correctamente", tipo: "exito" });
        } catch (err) {
            console.error("Error al agregar producto:", err);
            setToast({ mostrar: true, mensaje: "Error al registrar producto", tipo: "error" });
        }
    };

    const eliminarProducto = async () => {
        if (!productoAEliminar) return;

        try {
            setMostrarModalEliminacion(false);

            if (productoAEliminar.imagen_producto) {
                const nombreArchivo = productoAEliminar.imagen_producto
                    .split("/")
                    .pop()
                    .split("?")[0];

                await supabase.storage
                    .from("imagen_producto")
                    .remove([nombreArchivo])
                    .catch(() => { });
            }

            const { error } = await supabase
                .from("productos")
                .delete()
                .eq("id_producto", productoAEliminar.id_producto);

            if (error) throw error;

            await cargarProductos();

            setToast({
                mostrar: true,
                mensaje: "Producto eliminado correctamente",
                tipo: "exito"
            });

        } catch (err) {
            console.error("Error al eliminar:", err);

            setToast({
                mostrar: true,
                mensaje: "Error al eliminar producto",
                tipo: "error"
            });
        }
    };

    const abrirModalEliminacion = (producto) => {
        setProductoAEliminar(producto);
        setMostrarModalEliminacion(true);
    };

    const cargarProductos = async () => {
        try {
            setCargando(true);

            const { data, error } = await supabase
                .from("productos")
                .select("*")
                .order("id_producto", { ascending: true });

            if (error) throw error;

            setProductos(data || []);
            setProductosFiltrados(data || []);

        } catch (err) {
            console.error("Error al cargar productos:", err);

            setToast({
                mostrar: true,
                mensaje: "Error al cargar productos",
                tipo: "error"
            });

        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarCategorias();
        cargarProductos();
    }, []);


    const abrirModalEdicion = (producto) => {
        setProductoEditar(producto);
        setArchivoActualizar(null);
        setMostrarModalEdicion(true);
    };

    const manejoCambioInputEdicion = (e) => {
        const { name, value } = e.target;
        setProductoEditar((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const manejoCambioArchivoActualizar = (e) => {
        const archivo = e.target.files[0];
        if (archivo && archivo.type.startsWith("image/")) {
            setArchivoActualizar(archivo);
        }
    };

    const actualizarProducto = async () => {
        try {
            let imagenFinal = productoEditar.imagen_producto;

            if (archivoActualizar) {
                const nombreArchivo = `${Date.now()}_${archivoActualizar.name}`;

                const { error: uploadError } = await supabase.storage
                    .from("imagenes_productos")
                    .upload(nombreArchivo, archivoActualizar);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                    .from("imagenes_productos")
                    .getPublicUrl(nombreArchivo);

                imagenFinal = data.publicUrl;
            }

            const { error } = await supabase
                .from("productos")
                .update({
                    nombre_producto: productoEditar.nombre_producto,
                    descripcion_producto: productoEditar.descripcion_producto,
                    precio_producto: parseFloat(productoEditar.precio_producto),
                    stock_producto: parseInt(productoEditar.stock_producto),
                    id_categoria: parseInt(productoEditar.id_categoria),
                    imagen_producto: imagenFinal,
                })
                .eq("id_producto", productoEditar.id_producto);

            if (error) throw error;

            setMostrarModalEdicion(false);
            await cargarProductos();

            setToast({
                mostrar: true,
                mensaje: "Producto actualizado correctamente",
                tipo: "exito",
            });
        } catch (err) {
            console.error("Error al actualizar producto:", err);
            setToast({
                mostrar: true,
                mensaje: "Error al actualizar producto",
                tipo: "error",
            });
        }
    };

    const generarPDFProducto = (producto) => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text("Reporte de Producto", 14, 20);

        doc.line(14, 25, 195, 25);

        autoTable(doc, {
            startY: 35,
            head: [["Campo", "Valor"]],
            body: [
                ["ID", producto.id_producto],
                ["Nombre", producto.nombre_producto],
                ["Descripción", producto.descripcion_producto],
                ["Precio", `C$ ${producto.precio_producto}`],
                ["Stock", producto.stock_producto],
                ["Imagen", producto.imagen_producto || "Sin imagen"],
                ["ID Categoría", producto.id_categoria],
                ["Fecha de registro", producto.fecha_registro],
            ],
        });

        doc.save(`producto_${producto.id_producto}.pdf`);
    };

    return (
        <Container className="mt-3">
            {/* Título y botón */}
            <Row className="align-items-center mb-3">
                <Col className="d-flex align-items-center">
                    <h3 className="mb-0">
                        <i className="bi-bag-heart-fill me-2"></i> Productos
                    </h3>
                </Col>
                <Col xs={3} sm={5} md={5} lg={5} className="text-end">
                    <Button onClick={() => setMostrarModal(true)} size="md">
                        <i className="bi-plus-lg"></i>
                        <span className="d-none d-sm-inline ms-2">Nuevo Producto</span>
                    </Button>
                </Col>
            </Row>

            <hr />

            {/* Cuadro de búsqueda */}
            <Row className="mb-4">
                <Col md={6} lg={5}>
                    <CuadroBusquedas
                        textoBusqueda={textoBusqueda}
                        manejarCambioBusqueda={manejarBusqueda}
                        placeholder="Buscar por nombre, descripción o precio ..."
                    />
                </Col>
            </Row>

            {cargando ? (
                <div className="text-center my-4">
                    <Spinner animation="border" variant="primary" />
                    <p>Cargando productos...</p>
                </div>
            ) : productosFiltrados.length > 0 ? (
                <>
                    <div className="d-none d-md-block">
                        <TablaProductos
                            productos={productosFiltrados}
                            abrirModalEdicion={abrirModalEdicion}
                            abrirModalEliminacion={abrirModalEliminacion}
                            generarPDFProducto={generarPDFProducto}
                        />
                    </div>

                    <div className="d-block d-md-none">
                        <TarjetaProductos
                            productos={productosFiltrados}
                            abrirModalEdicion={abrirModalEdicion}
                            abrirModalEliminacion={abrirModalEliminacion}
                            generarPDFProducto={generarPDFProducto}
                        />
                    </div>
                </>
            ) : (
                <Alert variant="info">
                    No hay productos registrados.
                </Alert>
            )}



            {/* Modal de registro */}
            <ModalRegistroProducto
                mostrarModal={mostrarModal}
                setMostrarModal={setMostrarModal}
                nuevoProducto={nuevoProducto}
                manejoCambioInput={manejoCambioInput}
                manejoCambioArchivo={manejoCambioArchivo}
                agregarProducto={agregarProducto}
                categorias={categorias}
            />

            {/* Notificación */}
            <NotificacionOperacion
                mostrar={toast.mostrar}
                mensaje={toast.mensaje}
                tipo={toast.tipo}
                onCerrar={() => setToast({ ...toast, mostrar: false })}
            />

            <ModalEdicionProducto
                mostrarModalEdicion={mostrarModalEdicion}
                setMostrarModalEdicion={setMostrarModalEdicion}
                productoEditar={productoEditar}
                manejoCambioInputEdicion={manejoCambioInputEdicion}
                manejoCambioArchivoActualizar={manejoCambioArchivoActualizar}
                actualizarProducto={actualizarProducto}
                categorias={categorias}
            />

            <ModalEliminacionProducto
                mostrarModalEliminacion={mostrarModalEliminacion}
                setMostrarModalEliminacion={setMostrarModalEliminacion}
                eliminarProducto={eliminarProducto}
                producto={productoAEliminar}
            />
        </Container>
    );
};

export default Productos;