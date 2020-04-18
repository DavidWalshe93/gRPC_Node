FOR /F "tokens=* USEBACKQ" %%F IN (`where grpc_tools_node_protoc_plugin`) DO (
SET protoc_gen_path=%%F
)
ECHO "protoc-gen-path: %protoc_gen_path%"

protoc.exe -I=. .\proto\dummy.proto --js_out=import_style=commonjs,binary:.\server --grpc_out=.\server --plugin=protoc-gen-grpc=%protoc_gen_path%