interface AuthBackgroundProps {
	children?: React.ReactNode;
}

export function AuthBackground({ children }: AuthBackgroundProps) {
	return (
		<section className="relative flex w-[40%] h-full overflow-hidden bg-[#050811]">
			<div
				className="absolute inset-0 pointer-events-none"
				style={{
					background: `
						radial-gradient(ellipse 85% 85% at -5% -5%, rgba(29, 78, 216, 0.75) 0%, rgba(30, 58, 138, 0.4) 40%, transparent 75%),
						radial-gradient(ellipse 70% 70% at 80% 90%, rgba(29, 78, 216, 0.5) 0%, rgba(30, 58, 138, 0.25) 45%, transparent 75%),
						radial-gradient(ellipse 65% 65% at 50% 50%, rgba(29, 78, 216, 0.35) 0%, rgba(30, 58, 138, 0.15) 45%, transparent 75%),
						radial-gradient(ellipse 60% 60% at 20% 20%, rgba(37, 99, 235, 0.25) 0%, transparent 60%),
						linear-gradient(135deg, #0a1124 0%, #060913 55%, #04060c 100%)
					`,
				}}
			/>
			<div
				className="absolute inset-0 pointer-events-none z-10"
				style={{
					backgroundImage:
						"radial-gradient(circle, rgba(255, 255, 255, 0.09) 1px, transparent 1px)",
					backgroundSize: "24px 24px",
				}}
			/>
			<div className="relative z-20 w-full h-full text-worklyst-tiza">
				{children}
			</div>
		</section>
	);
}
