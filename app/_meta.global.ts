import { MetaRecord } from "nextra";


const meta = {
    index: {
        type: 'page',
        display: 'hidden'
    },
    docs: {
        type: 'page',
        title: 'Documentation',
        // items: {
        //     index: ''
        // },
        items: {
            "index": "Introduction",
            "how-it-works": "How It Works",
            "guides": "Guides"
        }
    },
    webapp: {
        href: 'https://app.happy.engineering',
        title: 'Web App',
        display: 'hidden'
    }
}

export default meta;