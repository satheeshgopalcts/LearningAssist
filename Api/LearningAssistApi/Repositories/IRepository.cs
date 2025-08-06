using LiteDB;
using System.Linq.Expressions;

namespace LearningAssistApi.Repositories
{
    public interface IRepository<T>
    {
        Task<T?> GetByIdAsync(ObjectId id);
        Task<T?> GetByIdAsync(string id);
        Task<IEnumerable<T>> GetAllAsync();
        Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate);
        Task<T?> FindOneAsync(Expression<Func<T, bool>> predicate);
        Task<T> InsertAsync(T entity);
        Task<bool> UpdateAsync(T entity);
        Task<bool> DeleteAsync(ObjectId id);
        Task<bool> DeleteAsync(string id);
        Task<int> CountAsync();
        Task<int> CountAsync(Expression<Func<T, bool>> predicate);
        Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate);
    }

    public class Repository<T> : IRepository<T> where T : class
    {
        private readonly ILiteDatabase _database;
        private readonly ILiteCollection<T> _collection;

        public Repository(ILiteDatabase database)
        {
            _database = database;
            _collection = _database.GetCollection<T>();
        }

        public async Task<T?> GetByIdAsync(ObjectId id)
        {
            return await Task.Run(() => _collection.FindById(id));
        }

        public async Task<T?> GetByIdAsync(string id)
        {
            try
            {
                var objectId = new ObjectId(id);
                return await GetByIdAsync(objectId);
            }
            catch
            {
                return null;
            }
        }

        public async Task<IEnumerable<T>> GetAllAsync()
        {
            return await Task.Run(() => _collection.FindAll().ToList());
        }

        public async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate)
        {
            return await Task.Run(() => _collection.Find(predicate).ToList());
        }

        public async Task<T?> FindOneAsync(Expression<Func<T, bool>> predicate)
        {
            return await Task.Run(() => _collection.FindOne(predicate));
        }

        public async Task<T> InsertAsync(T entity)
        {
            return await Task.Run(() =>
            {
                _collection.Insert(entity);
                return entity;
            });
        }

        public async Task<bool> UpdateAsync(T entity)
        {
            return await Task.Run(() => _collection.Update(entity));
        }

        public async Task<bool> DeleteAsync(ObjectId id)
        {
            return await Task.Run(() => _collection.Delete(id));
        }

        public async Task<bool> DeleteAsync(string id)
        {
            try
            {
                var objectId = new ObjectId(id);
                return await DeleteAsync(objectId);
            }
            catch
            {
                return false;
            }
        }

        public async Task<int> CountAsync()
        {
            return await Task.Run(() => _collection.Count());
        }

        public async Task<int> CountAsync(Expression<Func<T, bool>> predicate)
        {
            return await Task.Run(() => _collection.Count(predicate));
        }

        public async Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate)
        {
            return await Task.Run(() => _collection.Exists(predicate));
        }
    }
}
