-- Converte numero de texto para inteiro preservando os valores existentes.
ALTER TABLE "clientes" ALTER COLUMN "numero" TYPE INTEGER USING "numero"::integer;
