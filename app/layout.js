import "@blueprintjs/core/lib/css/blueprint.css"
import "@/styles/styles.scss"

export default function RootLayout({ children }) {
    return (
        <html lang="en">
        <body className={ (process.env.IS_WORK === '1') ? 'is-work' : '' }>
        { children }
        </body>
        </html>
    )
}