-- Update productos images to local files
-- Each UPDATE uses LIKE for fuzzy matching on names

UPDATE productos SET imagen = '/images/productos/Brocha_4_Profesional.jpg' WHERE nombre LIKE 'Brocha%4%Profesional%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%');
UPDATE productos SET imagen = '/images/productos/Destornillador_Set_6_pzs.jpg' WHERE nombre LIKE 'Destornillador Set 6%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%');
UPDATE productos SET imagen = '/images/productos/Flexómetro_5m.jpg' WHERE nombre LIKE 'Flexómetro%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%');
UPDATE productos SET imagen = '/images/productos/Grifo_Cocina.jpg' WHERE nombre LIKE 'Grifo%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%');
UPDATE productos SET imagen = '/images/productos/Pegamento_PVC_250ml.jpg' WHERE nombre LIKE 'Pegamento PVC%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%');
UPDATE productos SET imagen = '/images/productos/Tornillo_Madera_3_(kg).jpg' WHERE nombre LIKE 'Tornillo%Madera%3%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%');
UPDATE productos SET imagen = '/images/productos/Bisagra_Premium_4.webp' WHERE nombre LIKE 'Bisagra%Premium%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%');
UPDATE productos SET imagen = '/images/productos/Cerradura_Seguridad.jpg' WHERE nombre LIKE 'Cerradura%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%');
UPDATE productos SET imagen = '/images/productos/Foco_LED_15W.jpg' WHERE nombre LIKE 'Foco LED%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%');
UPDATE productos SET imagen = '/images/productos/Bomba_de_Agua_1HP.png' WHERE nombre LIKE 'Bomba de Agua%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%');
UPDATE productos SET imagen = '/images/productos/Cinta_Adhesiva_50m.jpg' WHERE nombre LIKE 'Cinta Adhesiva%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%');
UPDATE productos SET imagen = '/images/productos/Llave_Allen_Set_9_pzs.jpg' WHERE nombre LIKE 'Llave Allen%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%');
UPDATE productos SET imagen = '/images/productos/Nivel_de_Burbuja_60cm.jpg' WHERE nombre LIKE 'Nivel de Burbuja%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%');
UPDATE productos SET imagen = '/images/productos/Lijadora_Orbital_Bosch.jpg' WHERE nombre LIKE 'Lijadora Orbital%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%');
UPDATE productos SET imagen = '/images/productos/Sierra_Circular_Makita.jpg' WHERE nombre LIKE 'Sierra Circular%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%');
UPDATE productos SET imagen = '/images/productos/Disco_de_Corte_7.jpg' WHERE nombre LIKE 'Disco de Corte%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%');
UPDATE productos SET imagen = '/images/productos/Silicona_Transparente.jpg' WHERE nombre LIKE 'Silicona%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%');
UPDATE productos SET imagen = '/images/productos/Malla_Gallinero.jpg' WHERE nombre LIKE 'Malla Gallinero%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%');
UPDATE productos SET imagen = '/images/productos/Llave_Inglesa_12.png' WHERE nombre LIKE 'Llave Inglesa%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%');
UPDATE productos SET imagen = '/images/productos/Cable_THW_4mm_(100m).jpg' WHERE nombre LIKE 'Cable THW 4mm%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%');
UPDATE productos SET imagen = '/images/productos/Destornillador_Phillips.webp' WHERE nombre LIKE 'Destornillador Phillips%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%');
UPDATE productos SET imagen = '/images/productos/Impermeabilizante_20L.jpg' WHERE nombre LIKE 'Impermeabilizante%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%');
UPDATE productos SET imagen = '/images/productos/Llave_de_paso_12.jpg' WHERE nombre LIKE 'Llave de paso%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%');
UPDATE productos SET imagen = '/images/productos/Interruptor_Simple.jpg' WHERE nombre LIKE 'Interruptor Simple%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%');
UPDATE productos SET imagen = '/images/productos/Cinta_Métrica_5m.jpg' WHERE nombre LIKE 'Cinta Métrica%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%');
UPDATE productos SET imagen = '/images/productos/Cemento_CPN_50kg.jpg' WHERE nombre LIKE 'Cemento CPN%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%');
UPDATE productos SET imagen = '/images/productos/Clavo_2_(1kg).jpg' WHERE nombre LIKE 'Clavo 2%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%');
UPDATE productos SET imagen = '/images/productos/Pintura_Látex_20L.jpg' WHERE nombre LIKE 'Pintura Látex%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%');
UPDATE productos SET imagen = '/images/productos/Tubo_PVC_2_(6m).png' WHERE nombre LIKE 'Tubo PVC%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%');
UPDATE productos SET imagen = '/images/productos/Cable_THW_2.5mm_(100m).jpg' WHERE nombre LIKE 'Cable THW 2.5mm%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%');
UPDATE productos SET imagen = '/images/productos/Cemento_Portland_50kg.jpg' WHERE nombre LIKE 'Cemento Portland%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%');
UPDATE productos SET imagen = '/images/productos/Taladro_Bosch_500W.jpg' WHERE nombre LIKE 'Taladro Bosch%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%');
UPDATE productos SET imagen = '/images/productos/Martillo_Stanley_16oz.jpg' WHERE nombre LIKE 'Martillo Stanley%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%');
UPDATE productos SET imagen = '/images/productos/Ladrillo_Fiscal.jpg' WHERE nombre LIKE 'Ladrillo Fiscal%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%');
UPDATE productos SET imagen = '/images/productos/Varilla_38_(12m).jpg' WHERE nombre LIKE 'Varilla 3/8%' AND (imagen IS NULL OR imagen NOT LIKE '/images/productos/%');

-- Verify
SELECT id, nombre, imagen FROM productos ORDER BY id;
