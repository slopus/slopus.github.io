import { MetaRecord } from "nextra";


const meta = {
    index: {
        type: 'page',
        display: 'hidden'
    },
    docs: {
        type: 'page',
        title: 'Docs',
        // items: {
        //     index: ''
        // },
        items: {
            "index": "Getting Started",
            "how-it-works": "How It Works",
            "guides": "Guides",
            'faq': 'FAQ',
            'features': 'Features',
            //'contributing': 'Contributing'
        }
    },
    webapp: {
        href: 'https://app.happy.engineering',
        title: 'Web App',
        display: 'hidden'
    }
}

export default meta;