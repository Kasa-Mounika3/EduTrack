import { motion } from 'framer-motion';

const PageHeader = ({ eyebrow, title, description, action }) => {
  return (
    <motion.div
      className="page-header"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </motion.div>
  );
};

export default PageHeader;
