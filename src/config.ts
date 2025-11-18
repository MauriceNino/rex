export const CONFIG = {
	secret: process.env.REX_SECRET,
	script_path: process.env.REX_SCRIPT_PATH,
	port: +(process.env.REX_PORT ?? 3000),
};
